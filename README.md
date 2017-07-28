# sqlite
Browser SQLite

## Usage
~~~~
<script src="https://cdn.rawgit.com/kripken/sql.js/2dc092a7/js/sql.js"></script>
<script src="https://cdn.rawgit.com/mlaanderson/sqlite/571cbd09/sqlite.js"></script>
~~~~

## Create a Memory Database
~~~~
var db = new SQLite();
var stmt;

db.createStatement('CREATE TABLE states(State char, Ranking int, Population int)).exec();

stmt = db.createStatement('INSERT INTO states(State, Ranking, Population) VALUES(?, ?, ?)');

stmt.exec('California', 1, 38332521);
stmt.exec('Texas', 2, 26448193);
stmt.exec('New York', 3, 19651127);
stmt.exec('Florida', 4, 19552860);
stmt.exec('Illinois', 5, 12882135);
stmt.exec('Pennsylvania', 6, 12773801);
stmt.exec('Ohio', 7, 11570808);
stmt.exec('Georgia', 8, 9992167);
stmt.exec('Michigan', 9, 9895622);
stmt.exec('North Carolina', 10, 9848060);
stmt.exec('New Jersey', 11, 8899339);
stmt.exec('Virginia', 12, 8260405);
stmt.exec('Washington', 13, 6971406);
stmt.exec('Massachusetts', 14, 6692824);
stmt.exec('Arizona', 15, 6626624);
stmt.exec('Indiana', 16, 6570902);
stmt.exec('Tennessee', 17, 6495978);
stmt.exec('Missouri', 18, 6044171);
stmt.exec('Maryland', 19, 5928814);
stmt.exec('Wisconsin', 20, 5742713);
stmt.exec('Minnesota', 21, 5420380);
stmt.exec('Colorado', 22, 5268367);
stmt.exec('Alabama', 23, 4833722);
stmt.exec('South Carolina', 24, 4774839);
stmt.exec('Louisiana', 25, 4625470);
stmt.exec('Kentucky', 26, 4395295);
stmt.exec('Oregon', 27, 3930065);
stmt.exec('Oklahoma', 28, 3850568);
stmt.exec('Connecticut', 29, 3596080);
stmt.exec('Iowa', 30, 3090416);
stmt.exec('Mississippi', 31, 2991207);
stmt.exec('Arkansas', 32, 2959373);
stmt.exec('Utah', 33, 2900872);
stmt.exec('Kansas', 34, 2893957);
stmt.exec('Nevada', 35, 2790136);
stmt.exec('New Mexico', 36, 2085287);
stmt.exec('Nebraska', 37, 1868516);
stmt.exec('West Virginia', 38, 1854304);
stmt.exec('Idaho', 39, 1612136);
stmt.exec('Hawaii', 40, 1404054);
stmt.exec('Maine', 41, 1328302);
stmt.exec('New Hampshire', 42, 1323459);
stmt.exec('Rhode Island', 43, 1051511);
stmt.exec('Montana', 44, 1015165);
stmt.exec('Delaware', 45, 925749);
stmt.exec('South Dakota', 46, 844877);
stmt.exec('Alaska', 47, 735132);
stmt.exec('North Dakota', 48, 723393);
stmt.exec('District of Columbia', 49, 646449);
stmt.exec('Vermont', 50, 626630);
stmt.exec('Wyoming', 51, 582658);

var insStmt = db.createStatement('SELECT * FROM states WHERE State = ?');
var results = insStmt.query('South Dakota');

/*
    results is:
    [
        {
            "State": "South Dakota",
            "Ranking": 46,
            "Population": 844877
        }
    ]
*/
~~~~

## Load and Store a Database
~~~~
// Load
var db = new SQLite(localStorage.getItem('myData'));

// ...

// Store
localStorage.setItem(db.serialize());
~~~~