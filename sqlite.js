if (Number.isFinite === undefined) {
    Number.isFinite = function(num) {
        return (num !== Number.POSITIVE_INFINITY) && (num !== Number.NEGATIVE_INFINITY);
    }
}

function SQLite(database) {
    var connection = this;
    
    function loadFromTypedArray(value) {
        return new SQL.Database(value);
    }
    
    function loadFromArray(value) {
        return loadFromTypedArray(new Uint8Array(value));
    }
    
    function loadFromString(value) {
        var re = /[\[\]]/g;
        return loadFromArray(value.split(',').map(function(s) {
            s = s.replace(re, '');
            return parseInt(s);
        }));
    }
    
    function QuoteString(string) {
        if (typeof string === 'number') {
            if (Number.isFinite(string) === false) {
                return QuoteString(string.toString());
            }
            return string.toString();
        }
        string = string.toString();
        string = string.replace(/\\/g, '\\\\');
        string = string.replace('\x00', '\\x00');
        string = string.replace('\n', '\\n');
        string = string.replace('\r', '\\r');
        string = string.replace("'", "''");
        return "'" + string + "'";
    }
    
    function Prepare(sql) {
        // break the sql into chunks of quoted and none quoted
        // every odd indexed element is quoted
        var chunks = sql.split("'");
        var indexes = [];
        var pos = 0;

        if (chunks.length % 2 === 0) {
            // if there's an even number of chunks, then the quotes aren't balanced
            throw new Error("Unbalanced quotes");
        }

        chunks.map(function(chunk, n) {
            if (n % 2 === 1) {
                pos += chunk.length + 2;
                return;
            }
            var subPos = -1;
            while ((subPos = chunk.indexOf("?", subPos + 1)) >= 0) {
                indexes.push(pos + subPos);
            }
            pos += chunk.length;
        });

        return {
            sql: chunks.join("'"),
            indexes: indexes
        }
    }
    
    function Join(preparedSql, args) {
        if (preparedSql.indexes.length !== args.length) {
            throw new Error("Number of parameters does not match required parameters");
        }

        var sql = preparedSql.sql;
        var offset = 0;
        args.map(function(o, n) {
            o = QuoteString(o);
            sql = sql.substr(0, preparedSql.indexes[n] + offset) + o + sql.substr(preparedSql.indexes[n] + offset + 1);
            offset += o.length - 1;
        });

        return sql;
    }
    
    function PreparedStatement(sql) {
        var statement = this;
        var preparedSQL = Prepare(sql);
        
        this.query = function() {
            var args = Array.prototype.slice.call(arguments);
            
            var sqlString = Join(preparedSQL, args);
            
            var data = database.exec(sqlString);
            var result = [];
            
            if (data === null || data.length < 1) return [];
            
            for (var r = 0; r < data[0].values.length; r++) {
                var row = {};
                for (var c = 0; c < data[0].columns.length; c++) {
                    row[data[0].columns[c]] = data[0].values[r][c];
                }
                result.push(row);
            }
            return result;
        }
        
        this.exec = function() {
            var args = Array.prototype.slice.call(arguments);
            
            var sqlString = Join(preparedSQL, args);
            
            return database.run(sqlString);
        }
    }
    
    if (typeof database === 'string') {
        // this is probably a serialized array
        database = loadFromString(database);
    } else if ((typeof database === "undefined") || (database === null)) {
        // this is an empty database
        database = new SQL.Database();
    } else if (database.__proto__ === Uint8Array.prototype) {
        // loading a database from a Uint8Array
        database = loadFromTypedArray(database);
    } else if (database.__proto__ === Array.prototype) {
        // loading a database from an Array
        database = loadFromArray(database)
    }
    
    this.createStatement = function(sql) {
        return new PreparedStatement(sql);
    }
    
    this.serialize = function() {
        var data = database.export();
        var arr = [];
        
        for (var n = 0; n < data.length; n++) {
            arr.push(data[n]);
        }
        return JSON.stringify(arr);
    }

    this.toJSON = function() {
        var result = {};

        var tables = this.createStatement("SELECT name FROM sqlite_master WHERE type = ?").query("table");

        for (var n = 0; n < tables.length; n++) {
            result[tables[n].name] = []
            var rows = this.createStatement("SELECT * FROM " + tables[n].name).query();
            for (var r = 0; r < rows.length; r++) {
                result[tables[n].name].push(rows[r]);
            }
        }

        return result;
    }
}

SQLite.from = function(json) {
    var database = new SQLite();

    for (var table in json) {
        if ((json[table].__proto__ === Array.prototype) && (typeof json[table][0] === 'object')) {
            // might be valid table, construct the structure
            var tableData = json[table];
            var structure = {};
            for (var n = 0; n < tableData.length; n++) {
                var row = tableData[n];
                for (var column in row) {
                    if (column in structure === false) {
                        structure[column] = typeof row[column];
                    }

                    if (typeof row[column] !== typeof structure[column]) {
                        if (typeof row[column] === 'string') {
                            structure[column] = 'string';
                        }
                    }
                }
            }
            
            // create the table
            var columns = Object.keys(structure);
            var createSQL = "CREATE TABLE " + table + "(" + columns.map(function(key) {
                return key + " " + (structure[key] === "number" ? "float" : "char");
            }).join(", ") + ")";
            database.createStatement(createSQL).exec();

            // populate the table
            var insertSQL = "INSERT INTO " + table + " VALUES(" + columns.map((function() { return "?"})).join(",") + ")";

            var stmt = database.createStatement(insertSQL);
            for (var n = 0; n < tableData.length; n++) {
                var row = tableData[n];
                var data = columns.map(function(col) {
                    return row[col];
                });
                stmt.exec.apply(null, data);
            }

        } else {
            console.warn(table + " is not an array of objects");
            continue;
        }
    }

    return database;
}

if (typeof SQL === 'undefined') {
    console.error("sqlite.js requires kripken's sql.js.\r\nAdd <script src='https://cdn.rawgit.com/kripken/sql.js/2dc092a7/js/sql.js'></script> to your page.");
}