
top_symbol(shexDoC).
output_file('_tokenizer-table.js').

js_vars([
  startSymbol='"shapeMapDoC"',
  acceptEmpty=true
]).

:-reconsult(gen_ll1).
:-reconsult('../shapeMap11-grammar.pl').
