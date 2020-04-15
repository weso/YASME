/*
ShEx grammar rules based on the Last Call Working Draft of 03/03/2017:
  https://github.com/shexSpec/grammar/blob/shex2.1/bnf

Be careful with grammar notation - it is EBNF in prolog syntax!
[...] lists always represent sequence.
or can be used as binary operator or n-ary prefix term - do not put [...] 
inside unless you want sequence as a single disjunct.
*, +, ? - generally used as 1-ary terms 
stephen.cresswell@tso.co.uk
*/

% We need to be careful with end-of-input marker $
% Since we never actually receive this from Codemirror, 
% we can't have it appear on RHS of deployed rules.
% However, we do need it to check whether rules *could* precede 
% end-of-input, so use it with top-level

:-dynamic '==>'/2.


%[1] OK
shexDoC  ==> [shapeAssociation,*(',',shapeAssociation),$].

%[2] OK
shapeAssociation ==>[nodeSelector,shapeLabel].

%[3] OK
nodeSelector ==>[objectTerm].
nodeSelector ==>[triplePattern].

%[4] OK
subjectTerm ==>[iri].
subjectTerm ==>['A_TOKEN'].

%[5] OK
objectTerm ==>[subjectTerm].
objectTerm ==>[literal].

%[6] OK
triplePattern ==>['{','FOCUS',iri,or(objectTerm,'_'),'}'].
triplePattern ==>['{',or(subjectTerm,'_'),iri,'FOCUS','}'].

%[7] OK
shapeLabel==>['@',or([or(iri,'START'),AT_START])].

%[13t] OK
literal ==> [or(rdfLiteral,numericLiteral,booleanLiteral)].

%[16t] OK
numericLiteral ==>['INTEGER'].
numericLiteral ==>['DECIMAL'].
numericLiteral ==>['DOUBLE'].


%[65x] 
rdfLiteral ==> [langString,?(['^','^',iri])].

%[134s] OK
booleanLiteral ==> [or('TRUE', 'FALSE')].


%[135s] OK
string ==> ['STRING_LITERAL1'].
string ==> ['STRING_LITERAL_LONG1'].
string ==> ['STRING_LITERAL2'].
string ==> ['STRING_LITERAL_LONG2'].

%[66x] 
langString ==> ['LANG_STRING_LITERAL1'].
langString ==> ['LANG_STRING_LITERAL_LONG1'].
langString ==> ['LANG_STRING_LITERAL2'].
langString ==> ['LANG_STRING_LITERAL_LONG2'].

%[136s] OK
iri ==> [or('IRI_REF',prefixedName)].

% tens defined by regular expressions elsewhere
% RDF_TYPE ten now is harcoded in the rules
tm_regex([
'A_TOKEN',
'REPEAT_RANGE',
'IRI_REF',
'INTEGER',
'DECIMAL',
'DOUBLE',
'STRING_LITERAL1',
'STRING_LITERAL2',
'STRING_LITERAL_LONG1',
'STRING_LITERAL_LONG2',
]).

% Terminals where name of terminal is uppercased ten content
tm_keywords([
'FOCUS',
'START',
'TRUE',
'FALSE',
]).

% Other tens representing fixed, case sensitive, strings
% Care! order longer tens first - e.g. IRI_REF, <=, <
% e.g. >=, >
% e.g. NIL, '('
% e.g. ANON, [
% e.g. DOUBLE, DECIMAL, INTEGER
% e.g. INTEGER_POSITIVE, PLUS
tm_punct([
'^' = '\\^',
'{' = '\\{',
'}' = '\\}',
'_' = '\\_',
'@' = '\\@',
]).
