===============================================

STRUTTURE PER L'ESPORTAZIONE DEI FILE

===============================================



Pompe con Inverter

------------------

\[NomePompa].Command.Automatic

\[NomePompa].Command.Manual

\[NomePompa].Command.Cmd\_Man

\[NomePompa].Command.Inv\_Speed\_Man

\[NomePompa].Status.Ready

\[NomePompa].Status.Running

\[NomePompa].Status.Automatic

\[NomePompa].Status.Manual

\[NomePompa].Status.Selector

\[NomePompa].Monitor.Frequency\_Fbk

\[NomePompa].Monitor.Current

\[NomePompa].Monitor.Power

\[NomePompa].Monitor.Voltage

\[NomePompa].Worktime.Reset

\[NomePompa].Worktime.Total.Hour

\[NomePompa].Worktime.Total.Min

\[NomePompa].Worktime.Partial.Hour

\[NomePompa].Worktime.Partial.Min



Per gli indirizzi di questa struttura incrementare i seguenti valori all'indirizzo iniziale per generare gli indirizzi di ogni parametro della struttura : 

256,0

256,1

256,3

258,0

266,0

266,2

266,3

266,4

266,5

268,0

272,0

276,0

280,0

300,0

302,0

306,0

310,0

314,0



Pompe senza Inverter

--------------------

\[NomePompa].Command.Automatic

\[NomePompa].Command.Manual

\[NomePompa].Command.Cmd\_Man

\[NomePompa].Status.Ready

\[NomePompa].Status.Running

\[NomePompa].Status.Automatic

\[NomePompa].Status.Manual

\[NomePompa].Status.Selector

\[NomePompa].Worktime.Reset

\[NomePompa].Worktime.Total.Hour

\[NomePompa].Worktime.Total.Min

\[NomePompa].Worktime.Partial.Hour

\[NomePompa].Worktime.Partial.Min



Per gli indirizzi di questa struttura incrementare i seguenti valori all'indirizzo iniziale per generare gli indirizzi di ogni parametro della struttura : 

256,0

256,1

256,3

266,0

266,2

266,3

266,4

266,5

300,0

302,0

306,0

310,0

314,0



Valvole con Inverter

--------------------

\[NomeValvola].Command.Automatic

\[NomeValvola].Command.Manual

\[NomeValvola].Command.Cmd\_Man\_Open

\[NomeValvola].Command.Cmd\_Man\_Close

\[NomeValvola].Status.Ready

\[NomeValvola].Status.Opening

\[NomeValvola].Status.Closing

\[NomeValvola].Status.Automatic

\[NomeValvola].Status.Manual

\[NomeValvola].Status.Selector

\[NomeValvola].Status.Open

\[NomeValvola].Status.Close

\[NomeValvola].Worktime.Reset

\[NomeValvola].Worktime.Total.Hour

\[NomeValvola].Worktime.Total.Min

\[NomeValvola].Worktime.Partial.Hour

\[NomeValvola].Worktime.Partial.Min



Per gli indirizzi di questa struttura incrementare i seguenti valori all'indirizzo iniziale per generare gli indirizzi di ogni parametro della struttura : 

256,0

256,1

256,3

258,0

266,0

266,2

266,3

266,4

266,5

268,0

272,0

276,0



Valvole senza Inverter

----------------------

\[NomeValvola].Command.Automatic

\[NomeValvola].Command.Manual

\[NomeValvola].Command.Cmd\_Man

\[NomeValvola].Status.Ready

\[NomeValvola].Status.Automatic

\[NomeValvola].Status.Manual

\[NomeValvola].Status.Selector

\[NomeValvola].Worktime.Reset

\[NomeValvola].Worktime.Total.Hour

\[NomeValvola].Worktime.Total.Min

\[NomeValvola].Worktime.Partial.Hour

\[NomeValvola].Worktime.Partial.Min



Per gli indirizzi di questa struttura incrementare i seguenti valori all'indirizzo iniziale per generare gli indirizzi di ogni parametro della struttura : 

256,0

256,1

256,3

266,0

266,2

266,3

266,4

266,5

300,0

302,0

306,0

310,0

314,0





Analogiche

----------

\[NomeAnalogica]Output.Actual

\[NomeAnalogica]Output.Min

\[NomeAnalogica]Output.Max

\[NomeAnalogica]Limit.H

\[NomeAnalogica]Limit.L



Per gli indirizzi di questa struttura incrementare i seguenti valori all'indirizzo iniziale per generare gli indirizzi per ogni parametro della struttura : 

518,0

522,0

526,0

530,0

534,0



===============================================

NOTE:

\- Sostituire \[NomePompa], \[NomeValvola], o \[NomeAnalogica] con il nome specifico del componente

\- Gli indirizzi vengono calcolati automaticamente dal sito sommando gli offset definiti all'indirizzo iniziale

\- Le analogiche non hanno la configurazione "con inverter"

\- Gli indirizzi finali che andranno nella struttura che andro ad esportare dovranno essere : per gli address devi scrivere : DB"numero DB inserito dall utente".DBW"indirizzo numerico che genera come ha fatto fino  ad ora" ( se il data type è "Word" o "Int"), DB"numero DB inserito dall utente".DBX"indirizzo numerico che genera come ha fatto fino  ad ora" ( se il data type è "Bool"), DB"numero DB inserito dall utente".DBD"indirizzo numerico che genera come ha fatto fino  ad ora" ( se il data type è "Real" o "DInt" o "DWord" )

\- mettere nel sito un opzione che : SOLO NEGLI INDIRIZZI NUMERICI mi faccia mettere il punto o la virgola ( ad esempio : 100,0 o 100.0 ), NON DEVI MODIFICARE IL "." c'è DOPO "DB"num.DB"

===============================================



Inoltro le 5 strutture complete :



POMPE CON INVERTER



\[NomePompa].Command..Atomatic	Bool	256,0	R/W	Comando modalità automatica							

\[NomePompa].Command.Manual	Bool	256,1	R/W	Comando modalità manuale							

\[NomePompa].Command.Cmd\_Man	Bool	256,3	R/W	Comando start manuale 							

\[NomePompa].Command.Inv\_Speed\_Man	Real	258,0	R/W	Riferimento manuale velocità inverter 		0	50	Hz	0	50	

\[NomePompa].Status.Ready	Bool	266,0	R	Utenza pronta 							

\[NomePompa].Status.Running	Bool	266,2	R	Utenza in marcia							

\[NomePompa].Status.Automatic	Bool	266,3	R	Utenza in modalità automatica							

\[NomePompa].Status.Manual	Bool	266,4	R	Utenza in modalità manuale 							

\[NomePompa].Status.Selector	Bool	266,5	R	Selettore utenza in remoto 							

\[NomePompa].Monitor.Frequency\_Fbk	Real	268,0	R	Feedback frequenza inverter		0	50	Hz	0	50	

\[NomePompa].Monitor.Current	Real	272,0	R	Feedback corrente		0	999	A	0	999	

\[NomePompa].Monitor.Power	Real	276,0	R	Feedback potenza		0	999	Kw	0	999	

\[NomePompa].Monitor.Voltage	Real	280,0	R	Feedback Tensione inverter		0	9999	V	0	9999	

\[NomePompa].Worktime.Reset	Bool	300,0	R/W	Comando reset ore parziali utenza							

\[NomePompa].Worktime.Total.Hour	DInt	302,0	R	Ore totali 		0	9999999	Min	0	9999999	

\[NomePompa].Worktime.Total.Min	Int	306,0	R	Minuti totali 		0	59	Min	0	59	

\[NomePompa].Worktime.Partial.Hour	DInt	310,0	R	Ore Parziali 		0	9999999	Min	0	9999999	

\[NomePompa].Worktime.Partial.Min	Int	314,0	R	Minuti Parziali 		0	59	Min	0	59	



-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



POMPE SENZA INVERTER



\[NomePompa].Command.Atomatic	Bool	256,0	R/W	Comando modalità automatica							

\[NomePompa].Command.Manual	Bool	256,1	R/W	Comando modalità manuale							

\[NomePompa].Command.Cmd\_Man	Bool	256,3	R/W	Comando start manuale 							

\[NomePompa].Status.Ready	Bool	266,0	R	Utenza pronta 							

\[NomePompa].Status.Running	Bool	266,2	R	Utenza in marcia							

\[NomePompa].Status.Automatic	Bool	266,3	R	Utenza in modalità automatica							

\[NomePompa].Status.Manual	Bool	266,4	R	Utenza in modalità manuale 							

\[NomePompa].Status.Selector	Bool	266,5	R	Selettore utenza in remoto 							

\[NomePompa].Worktime.Reset	Bool	300,0	R/W	Comando reset ore parziali utenza							

\[NomePompa].Worktime.Total.Hour	DInt	302,0	R	Ore totali 		0	9999999	Min	0	9999999	

\[NomePompa].Worktime.Total.Min	Int	306,0	R	Minuti totali 		0	59	Min	0	59	

\[NomePompa].Worktime.Partial.Hour	DInt	310,0	R	Ore Parziali 		0	9999999	Min	0	9999999	

\[NomePompa].Worktime.Partial.Min	Int	314,0	R	Minuti Parziali 		0	59	Min	0	59	





-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



VALVOLE CON INVERTER



\[NomeValvola].Command..Atomatic	Bool		2482,0	R/W	Comando modalità automatica						

\[NomeValvola].Command.Manual	Bool		2482,1	R/W	Comando modalità manuale						

\[NomeValvola].Command.Cmd\_Man\_Open	Bool		2482,3	R/W	Comando manuale Apertura						

\[NomeValvola].Command.Cmd\_Man\_Close	Bool		2484,0	R/W	Comando manuale  Chiusura 						

\[NomeValvola].Status.Ready	Bool		2492,0	R	Utenza pronta 						

\[NomeValvola].Status.Opening	Bool		2492,2	R	Utenza in apertura						

\[NomeValvola].Status.Closing	Bool		2492,3	R	Utenza in chiusura						

\[NomeValvola].Status.Automatic	Bool		2492,4	R	Utenza in modalità automatica						

\[NomeValvola].Status.Manual	Bool		2492,5	R	Utenza in modalità manuale 						

\[NomeValvola].Status.Selector	Bool		2494,0	R							

\[NomeValvola].Status.Open	Bool		2498,0	R	Utenza aperta						

\[NomeValvola].Status.Close	Bool		2502,0	R	Utenza chiusa						





-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



VALVOLE SENZA INVERTER



\[NomeValvola].Command.Atomatic	Bool		256,0	R/W	Comando modalità automatica							

\[NomeValvola].Command.Manual	Bool		256,1	R/W	Comando modalità manuale							

\[NomeValvola].Command.Cmd\_Man	Bool		256,3	R/W	Comando start manuale 							

\[NomeValvola].Status.Ready	Bool		266,0	R	Utenza pronta 							

\[NomeValvola].Status.Running	Bool		266,2	R	Utenza in marcia							

\[NomeValvola].Status.Automatic	Bool		266,3	R	Utenza in modalità automatica							

\[NomeValvola].Status.Manual	Bool		266,4	R	Utenza in modalità manuale 							

\[NomeValvola].Status.Selector	Bool		266,5	R	Selettore utenza in remoto 							

\[NomeValvola].Worktime.Reset	Bool		300,0	R/W	Comando reset ore parziali utenza							

\[NomeValvola].Worktime.Total.Hour	DInt		302,0	R	Ore totali 		0	9999999	Min	0	9999999	

\[NomeValvola].Worktime.Total.Min	SInt		306,0	R	Minuti totali 		0	59	Min	0	59	

\[NomeValvola].Worktime.Partial.Hour	DInt		310,0	R	Ore Parziali 		0	9999999	Min	0	9999999	

\[NomeValvola].Worktime.Partial.Min	SInt		314,0	R	Minuti Parziali 		0	59	Min	0	59	



-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



ANALOGICHE



\[NomeAnalogica].Output.Actual	REAL	518,0	R	Valore attuale analogica ingenierizzata							

\[NomeAnalogica].Output.Min	REAL	522,0	R/W	Max scalatura		0	9999999		0	9999999	

\[NomeAnalogica].Output.Max	REAL	526,0	R/W	Min scalatura		0	59		0	59	

\[NomeAnalogica].Limit.H	REAL	530,0	R/W	Setpoint allarme alto livello		0	9999999		0	9999999	

\[NomeAnalogica].Limit.L	REAL	534,0	R/W	Setpoint allarme basso livello		0	59		0	59	



-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Istruzioni :

* le cose tra parentesi \[] dovranno essere sostituite 
* gli indirizzi che ho appena messo come esempio , dovranno essere sostituiti
* Tutte le tabelle avranno come titoli per ogni colonna nel file excel : Tag Name,	Data type,	Address PLC,	ACCESSO,	Comment,	Stato,	RaW min,	RaW maX,	Unità di misura,	Scala min,	Scala maX,	Modifiche.







