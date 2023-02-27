const fs = require("fs");
const {Interpreter} = require("./Interpreter");
const {Parser} = require("./Parser");


// const interpreter = new Interpreter({
// 	source: `Nech faktoriál je funkcia (
// 	Ak n je menej ako 0, tak (
// 		Vráť -1.
// 	), inak Ak n sa rovná 0, tak (
// 		Vráť 1.
// 	), inak (
// 		Vráť vynásob n s funkčná hodnota funkcie faktoriál, pre od n odpočítaj 1.
// 	).
// ), definovaná pre n.
// Vypíš funkčná hodnota funkcie faktoriál, pre 5.`});

//TODO: need fix: no period after if statement returns undefined
//TODO: Change in line number decade breaks the spacing in the error message
//TODO: Fix error message when unterminated string

// const interpreter = new Interpreter({
// 	source: `
// Nech Iterátor je
// 	trieda Iterátor obsahujúca
// 		konštruktor, predvolene (...),
// 		index, predvolene 0 a
// 		ďalší, predvolene funckia (...),

// Nech Pole je
// 	trieda Pole obsahujúca
// 		konštruktor, predvolene (funkcia (...), definovaná pre x),
// 		length, predvolene 0,
// 		push, predvolene (funkcia (
// 			Nech index je hodnota vlastnosti "length" objektu tento objekt.
// 			nastav hodnota vlastnosti index objektu tento objekt na x.
// 			nastav hodnota vlastnosti "length" objektu tento objekt na (ku index pripočítaj 1).
// 			Vráť x.
// 		), definovaná pre x),
// 		pop, predvolene funkcia (
// 			Nech index je (od hodnota vlastnosti "length" objektu tento objekt odpočítaj 1).
// 			Nech x je (hodnota vlastnosti index objektu tento objekt).
// 			nastav hodnota vlastnosti index objektu tento objekt na nedefinovaná hodnota.
// 			nastav hodnota vlastnosti "length" objektu tento objekt na index.
// 			Vráť x.
// 		) a
// 		iterátor, predvolene (funkcia (
// 			Vráť nová inštancia triedy trieda rozširujúca triedu Iterátor, obsahujúca
// 				index, predvolene 0 a
// 				ďalší, predvolene funkcia (
// 					Nech index je hodnota vlastnosti "index" objektu tento objekt.
// 					Nech x je (hodnota vlastnosti index objektu tento objekt).
// 					nastav hodnota vlastnosti "index" objektu tento objekt na (ku index pripočítaj 1).
// 					Vráť x.
// 				).
// 		)).

// Nech arr je nová inštancia triedy Pole.
// funkčná hodnota funkcie hodnota vlastnosti "push" objektu arr, pre 1.
// funkčná hodnota funkcie hodnota vlastnosti "push" objektu arr, pre 2.
// funkčná hodnota funkcie hodnota vlastnosti "push" objektu arr, pre 3.

// Vypíš hodnota vlastnosti "length" objektu arr.
// Vypíš funkčná hodnota funkcie hodnota vlastnosti "pop" objektu arr.
// Vypíš funkčná hodnota funkcie hodnota vlastnosti "pop" objektu arr.
// `});

// const interpreter = new Interpreter({
// 	source: `
// Nech print_props je funkcia (
// 	Vypíš "this.a =".
// 	Vypíš hodnota vlastnosti "a" objektu obj.
// 	Vypíš "this.b =".
// 	Vypíš hodnota vlastnosti "b" objektu obj.
// 	Vypíš "this.c =".
// 	Vypíš hodnota vlastnosti "c" objektu obj.
// ), definovaná pre obj.

// Nech A je trieda A obsahujúca
// 	konštruktor, predvolene funkcia (
// 		Vypíš "A".

// 		funkčná hodnota funkcie print_props, pre tento objekt.
// 	) a
// 	a, predvolene (Vypíš "A, a" a 10).

// Nech B je trieda B rozširujúca triedu A, obsahujúca
// 	konštruktor, predvolene funkcia (
// 		Vypíš "B, before super".
// 		funkčná hodnota funkcie nadtrieda.
// 		Vypíš "B, after super".

// 		funkčná hodnota funkcie print_props, pre tento objekt.
// 	) a
// 	b, predvolene (Vypíš "B, b" a 20).

// Nech C je trieda C rozširujúca triedu B, obsahujúca
// 	konštruktor, predvolene funkcia (
// 		Vypíš "C, before super".
// 		funkčná hodnota funkcie nadtrieda.
// 		Vypíš "C, after super".

// 		funkčná hodnota funkcie print_props, pre tento objekt.
// 	) a
// 	c, predvolene (Vypíš "C, c" a 30).

// Nech c je nová inštancia triedy C.
// Vypíš "=====".
// Vypíš hodnota vlastnosti "a" objektu c.
// Vypíš hodnota vlastnosti "b" objektu c.
// Vypíš hodnota vlastnosti "c" objektu c.
// `});

// const interpreter = new Interpreter({
// 	source: `
// Nech A je trieda A obsahujúca
// 	konštruktor, predvolene funkcia (...),
// 	prop1 a
// 	prop2.
// Nech a je nová inštancia triedy A.
// Pre každé i v objekte a (
// 	Vypíš i.
// ).
// `});



// const interpreter = new Interpreter({
// 	source: `
// Nech fibonacci je nová inštancia triedy
// 	trieda obsahujúca 
// 	a, predvolene 0,
// 	b, predvolene 1,
// 	c, predvolene 1 a
// 	next, predvolene funkcia (
// 		Vypíš tento objekt.
// 		Vypíš argumenty funkcie.

// 		nastav hodnota vlastnosti "a" objektu tento objekt na hodnota vlastnosti "b" objektu tento objekt.
// 		nastav hodnota vlastnosti "b" objektu tento objekt na hodnota vlastnosti "c" objektu tento objekt.
// 		nastav hodnota vlastnosti "c" objektu tento objekt na ku hodnota vlastnosti "a" objektu tento objekt pripočítaj hodnota vlastnosti "b" objektu tento objekt.
// 		Vráť hodnota vlastnosti "c" objektu tento objekt.
// 	).

// Vypíš fibonacci.
// Nech clen je funkčná hodnota funkcie hodnota vlastnosti "next" objektu fibonacci.
// nastav clen na funkčná hodnota funkcie hodnota vlastnosti "next" objektu fibonacci.
// Vypíš fibonacci.
// Vypíš clen.
// `});

// const interpreter = new Interpreter({
//     source: `
// Nech A je trieda obsahujúca
//     func, predvolene (funkcia (
//         Nech x je 10.

//         Vráť nová inštancia triedy trieda obsahujúca
//             method, predvolene funkcia (
//                 Vypíš x.
//             ).
//     )).

// Nech B je trieda rozširujúca triedu A.

// Nech f je hodnota vlastnosti "func" objektu nová inštancia triedy B. 
// Nech instance je funkčná hodnota funkcie f.
// funkčná hodnota funkcie hodnota vlastnosti "method" objektu instance.
// `});


const interpreter = new Interpreter({
	source: `
Nech arr je nová inštancia triedy Pole, pre 10, 20, 30, 40 a 50.

Pre každé i a x v objekte arr (
    Vypíš i.
    Vypíš x.
).
`});
// const interpreter = new Interpreter({
// 	source: `Nech f1 je funkcia f1: (
// 	Vypíš "f1".
// 	error.
// ).
// funkčná hodnota funkcie f1.`});
// const interpreter = new Interpreter({
// 	source: `Nech f1 je funkcia f1: (
// 	Vypíš "f1".		
// 	error.
// ).
// Nech f2 je funkcia f2: (
// 	Vypíš "f2".
// 	funkčná hodnota funkcie f1.
// ).
// Nech f3 je funkcia f3: (
// 	Vypíš "f3".
// 	funkčná hodnota funkcie f2.
// ).
// Nech Super je trieda Super obsahujúca
// 	konštruktor, predvolene funkcia (
// 		Vypíš "super".
// 		funkčná hodnota funkcie f3.
// 	).
// Nech class je trieda Test rozširujúca triedu Super, obsahujúca
// 	konštruktor, predvolene funkcia (
// 		Vypíš "constructor".
// 		funkčná hodnota funkcie nadtrieda.
// 	) a
// 	prop, predvolene 10.

// Nech instance je nová inštancia triedy class, pre 8.
// Vypíš hodnota vlastnosti "prop" objektu instance.`});
// const interpreter = new Interpreter({source: `hodnota vlastnosti "x" objektu ku 5 pripočítaj 3.`});
// const interpreter = new Interpreter({source: `funkčná hodnota funkcie ku 10 pripočítaj 3.`});
// const interpreter = new Interpreter({source: `nová inštancia triedy ku 10 pripočítaj 3.`});
// const interpreter = new Interpreter({source: `funkčná hodnota funkcie 10.`});
// const interpreter = new Interpreter({source: `Nech str je nová inštancia triedy Číslo, pre "123". Vypíš str.`});
// const interpreter = new Interpreter({source: `Nech str je nová inštancia triedy Reťazec, pre "abc". Vypíš funkčná hodnota funkcie hodnota vlastnosti "kód_znaku_na" objektu str, pre 0.`});
// const interpreter = new Interpreter({source: `Nech str je nová inštancia triedy Reťazec, pre "test!". Vypíš str.`});
// const interpreter = new Interpreter({source: `Nech arr je nová inštancia triedy Pole, pre 10, 20, 30, 40 a 50. Vypíš arr.`});
// const interpreter = new Interpreter({source: `Nech module je importuj modul "module.spj". Vypíš hodnota vlastnosti "PI" objektu module.`});
// const interpreter = new Interpreter({source: `Nech f je funkcia (Vypíš argumenty funkcie. Pre každé i a arg v objekte argumenty funkcie (Vypíš i. Vypíš arg. Vypíš "====".).). funkčná hodnota funkcie f, pre 1, 2 a 3.`});
// const interpreter = new Interpreter({source: `Nech A je trieda obsahujúca obsahujúca prop.`});
// const interpreter = new Interpreter({source: `Nech A je trieda A obsahujúca konštruktor, predvolene (funkcia (...)) a prop. Nech a je nová inštancia triedy A. Pre každé i v objekte a (Vypíš i.).`});
// const interpreter = new Interpreter({source: `funckia a + b.`});
// const interpreter = new Interpreter({source: `trieda A obsahujúca a a test, predvolene 10.`});
// const interpreter = new Interpreter({source: `funkcia ku a pripočítaj b, definovaná pre a, b, predvolene (ku 5 pripočítaj 8).`});
// const interpreter = new Interpreter({source: `funkcia ku a pripočítaj b, definovaná pre a a b, predvolene (ku 5 pripočítaj 8).`});
// const interpreter = new Interpreter({source: `funkcia ku a pripočítaj b, definovaná pre a a b, predvolene 5.`});
// const interpreter = new Interpreter({source: `Vypíš 10 a 20.`});
// const interpreter = new Interpreter({source: `Nech A je trieda obsahujúca konštruktor, predvolene funkcia (Vypíš 1111. Vypíš tento objekt.Vypíš 2222. Vypíš hodnota vlastnosti "a" objektu tento objekt.) a a, predvolene 10. Nech a je nová inštancia triedy A. Vypíš hodnota vlastnosti "a" objektu a.`});
// const interpreter = new Interpreter({source: `Nech A je trieda obsahujúca a, predvolene funkcia (Vypíš hodnota vlastnosti a objektu tento objekt.)..`});
// const interpreter = new Interpreter({source: `Vypíš tento objekt.`});
// const interpreter = new Interpreter({source: `Nech f je nedefinovaná hodnota. (Nech a je 0. nastav f na funkcia (Vráť nastav a na ku a pripočítaj 1.).). Vypíš funkčná hodnota funkcie f. Vypíš funkčná hodnota funkcie f.`});
// const interpreter = new Interpreter({source: `Nech A je trieda A obsahujúca a. Nech B je trieda B rozširujúca triedu ((Vypíš 10) a A), obsahujúca b. Vypíš B.`});
// const interpreter = new Interpreter({source: `Vypíš pravda.`});
// const interpreter = new Interpreter({source: `Nech obj je nová inštancia triedy Objekt. nastav hodnota vlastnosti "a" objektu obj na 10. Pre každé key a value v objekte obj (Vypíš key. Vypíš value.).`});
// const interpreter = new Interpreter({source: `Nech A je trieda A rozširujúca triedu B, obsahujúca a, predvolene 10. Nech a je nová inštancia triedy A.`});
// const interpreter = new Interpreter({source: `trieda A rozširujúca triedu B, obsahujúca a, predvolene 10.`});
// const interpreter = new Interpreter({source: `trieda A obsahujúca a, predvolene funkcia (...).`});
// const interpreter = new Interpreter({source: `trieda A obsahujúca a, predvolene 10.`});
// const interpreter = new Interpreter({source: `funkcia (...).`});
// const interpreter = new Interpreter({source: `trieda obsahujúca a, predvolene funkcia (...).`});
// const interpreter = new Interpreter({source: `trieda obsahujúca a, predvolene 10.`});
// const interpreter = new Interpreter({source: `Nech i je 0. Pokiaľ i je menej ako 5, tak (Vypíš nastav i na ku i pripočítaj 1.).`});
// const interpreter = new Interpreter({source: `'Te\'st'.`});
// const interpreter = new Interpreter({source: `"Te'st".`});
// const interpreter = new Interpreter({source: `"Te\"st".`});
// const interpreter = new Interpreter({source: `"Test".`});
// const interpreter = new Interpreter({source: `5 je viac alebo sa rovná 5.`});
// const interpreter = new Interpreter({source: `5 je menej alebo sa rovná 5.`});
// const interpreter = new Interpreter({source: `5 je menej ako 4.`});
// const interpreter = new Interpreter({source: `5 je viac ako 4.`});
// const interpreter = new Interpreter({source: `5 sa rovná 5.`});
// const interpreter = new Interpreter({source: `Vráť.`});
// const interpreter = new Interpreter({source: `Vráť ku b pri0počítaj 5.`});
// const interpreter = new Interpreter({source: `funkcia (Vráť ku a pri0počítaj 5.), definovaná pre a.`});
// const interpreter = new Interpreter({source: `funkcia ku a pripočítaj 5, definovaná pre a.`});
// const interpreter = new Interpreter({source: `Nech a je 10. Ak a, tak nastav a na 5, inak Ak 5, tak (Vypíš 1.), inak nastav a na 20. Vypíš a.`});
// const interpreter = new Interpreter({source: `Nech add je funkcia (Vráť ku a pripočítaj b.), definovaná pre a a b. Vypíš funkčná hodnota funkcie add, pre 10 a 20.`});
// const interpreter = new Interpreter({source: `Nech add je funkcia (ku a pripočítaj b), definovaná pre a a b. Vypíš funkčná hodnota funkcie add, pre 10 a 20.`}); //TODO: need fix 
// const interpreter = new Interpreter({source: `Nech add je funkcia ku a pripočítaj b, definovaná pre a a b. Vypíš funkčná hodnota funkcie add, pre 10 a 20.`});
// const interpreter = new Interpreter({source: `(2-há odmocnina z 10).`});
// const interpreter = new Interpreter({source: `(10).`}); //TODO: need fix (empty statement at the end)
// const interpreter = new Interpreter({source: `ku -b pripočítaj 5.`});
// const interpreter = new Interpreter({source: `nová inštancia triedy Používateľ. smenom Jozko a vekom 10.`});
/* const interpreter = new Interpreter({
	source: `-tá-tá-tá odmocnina z 10.`
}); */
/* const interpreter = new Interpreter({
	source: `nastav hodnota vlastnosti (ku 10 pripočítaj 5) objektu A na 8
nastav a na 10.`}); */
// const interpreter = new Interpreter({source: `nastav hodnota vlastnosti (ku 10 pripočítaj 5) na 8.`});
// const interpreter = new Interpreter({source: `nastav hodnota vlastnosti ku 10 pripočítaj 1 objektu A na 10.`});
// const interpreter = new Interpreter({source: `nastav hodnota vlastnosti B objektu A na 10.`});
// const interpreter = new Interpreter({source: `nastav ku 10 pripočítaj 1 na 5.`});
// const interpreter = new Interpreter({source: `Nech ku 10 pripočítaj 1 je 5.`});
// const interpreter = new Interpreter({source: `hodnota vlastnosti ku 10 pripočítaj 1 objektu A.`});
// const interpreter = new Interpreter({source: `hodnota vlastnosti B objektu A.`});
// const interpreter = new Interpreter({source: `nová inštancia triedy a.`});
// const interpreter = new Interpreter({source: `trieda Pole obsahujúca push, predvolene funkcia ku 1 pripočítaj 5 a length, predvolene 0.`});
// const interpreter = new Interpreter({source: `trieda Pole obsahujúca push, predvolene funkcia ku 1 pripočítaj 5.`});
// const interpreter = new Interpreter({source: `trieda Test obsahujúca A, predvolene 10 a B.`});
// const interpreter = new Interpreter({source: `trieda Test obsahujúca A a B.`});
// const interpreter = new Interpreter({source: `trieda Test.`});
// const interpreter = new Interpreter({source: `Nech func je funkcia (Nech a je 10. Nech b je 20. Vráť ku a pripočítaj b.), definovaná pre a a b.`});
// const interpreter = new Interpreter({source: `funkcia (Nech a je 10. Nech b je Nech q je -1. Vráť ku a pripočítaj b.).`});
// const interpreter = new Interpreter({source: `funkcia (Nech a je 10. Nech b je 20. Vráť ku a pripočítaj b.).`});
// const interpreter = new Interpreter({source: `funkcia test: (as.2).`});
// const interpreter = new Interpreter({source: `...`});
// const interpreter = new Interpreter({source: `(Nech x je 20. ku x pripočítaj 5.).`});
// const interpreter = new Interpreter({source: `Nech a je Nech b je 16.`});
// const interpreter = new Interpreter({source: `Nech typ je typ 5. Vráť typ typ.`});
// const interpreter = new Interpreter({source: `(od a 14) a asdsd.`});
// const interpreter = new Interpreter({source: `-(ku 2 pripočítaj 8)-tá odmocnina z 16.`});
// const interpreter = new Interpreter({source: `-od 5 odpočítaj 2.`});
// const interpreter = new Interpreter({source: `Nech od je 1. nastav x na od od odpočítaj 1.`});
// const interpreter = new Interpreter({source: `umocni a na 10.`});
// const interpreter = new Interpreter({source: `Nech a je 10 a 11.`});
// const interpreter = new Interpreter({source: `Nech a je (10 a 11).`});
// const interpreter = new Interpreter({source: `10.20.30.3.`});
// const interpreter = new Interpreter({source: `--12.`});
// const interpreter = new Interpreter({source: `nastav a na 10, nastav b na 11 a nastav c na 12.`});
// const interpreter = new Interpreter({source: `(nastav a na 10) a 11.`});
// const interpreter = new Interpreter({source: `nastav a na 10 a 11.`});
// const interpreter = new Interpreter({source: `nastav a na 10.`});
// const interpreter = new Interpreter({source: `(10).`});
// const interpreter = new Interpreter({source: `(10 a 11).`});
// const interpreter = new Interpreter({source: `(10, 20, 30).`});
// const interpreter = new Interpreter({source: `(10, 20 a 30).`});
// const interpreter = new Interpreter({source: `(vynásob 4 s (vynásob a s c)).`});
// const interpreter = new Interpreter({source: `Nech a je ku 10 pripočítaj 5. nastav a na ku a pripočítaj 5. Vráť a.`});
// const interpreter = new Interpreter({source: `od 2 odpočítaj ku 6 pripočítaj 3.`});
// const interpreter = new Interpreter({source: `ku 2 pripočítaj 3.`});
// const interpreter = new Interpreter({source: `Nech á je 2.`});
// const interpreter = new Interpreter({source: fs.readFileSync("./test.spj.bak", "utf8")});
const result = interpreter.interpret();

console.log(result.toString());
