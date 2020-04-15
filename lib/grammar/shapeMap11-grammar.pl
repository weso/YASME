/*
ShapeMAp grammar rules based on:
  http://shex.io/shape-map/#grammar

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
shapeMap  ==> [shapeAssociation,*([',',shapeAssociation]),$].

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
triplePattern ==>[or([
                    ['{','FOCUS',iri,or(objectTerm,'_'),'}'],
                    ['{',or(subjectTerm,'_'),iri,'FOCUS','}']]  
                  )].


%[7] OK
shapeLabel==>['@',or([or(iri,'START'),'AT_START'])].

%[13t] OK
literal ==> [or(rdfLiteral,numericLiteral,booleanLiteral)].

%[16t] OK
numericLiteral ==>['INTEGER'].
numericLiteral ==>['DECIMAL'].
numericLiteral ==>['DOUBLE'].


%[65x] 
rdfLiteral ==> [or(langString,string),?(['^','^',iri])].

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
iri ==> ['IRI_REF'].

% tens defined by regular expressions elsewhere
% RDF_TYPE ten now is harcoded in the rules
tm_regex([
'IRI_REF',
'INTEGER',
'DECIMAL',
'DOUBLE',
'STRING_LITERAL1',
'STRING_LITERAL2',
'STRING_LITERAL_LONG1',
'STRING_LITERAL_LONG2',
'LANG_STRING_LITERAL1',
'LANG_STRING_LITERAL2',
'LANG_STRING_LITERAL_LONG1',
'LANG_STRING_LITERAL_LONG2',
'A_TOKEN',
'AT_START'
]).
% Terminals where name of terminal is uppercased ten content
tm_keywords([
'FOCUS',
'TRUE',
'FALSE',
'START'
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
',' = '\\,',
'{' = '\\{',
'}' = '\\}',
'_' = '\\_',
'@' = '\\@'
]).