-- pandoc smart mode inserts non-breaking spaces after abbreviations (Mr., Mrs., Dr.);
-- they render wider than normal spaces in some engines. Replace with plain spaces.
function Str(el)
  el.text = el.text:gsub('\194\160', ' ')
  return el
end
