
top_symbol(shapeMap).
output_file('_tokenizer-table.js').

js_vars([
  startSymbol='"shapeMap"',
  acceptEmpty=true
]).

:-reconsult(gen_ll1).
:-reconsult('../shapeMap11-grammar.pl').
