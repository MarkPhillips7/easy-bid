// Excerpt from https://github.com/SheetJS/js-xlsx/blob/53f7f6d9446ccd680c9b13992d6dcdccde49a8f6/bits/90_utils.js
// Was getting "Cannot find module 'jszip'"" error when trying to use XLSX in client code

function decode_row(rowstr) { return parseInt(unfix_row(rowstr),10) - 1; }
function encode_row(row) { return "" + (row + 1); }
function fix_row(cstr) { return cstr.replace(/([A-Z]|^)(\d+)$/,"$1$$$2"); }
function unfix_row(cstr) { return cstr.replace(/\$(\d+)$/,"$1"); }

function decode_col(colstr) { var c = unfix_col(colstr), d = 0, i = 0; for(; i !== c.length; ++i) d = 26*d + c.charCodeAt(i) - 64; return d - 1; }
function encode_col(col) { var s=""; for(++col; col; col=Math.floor((col-1)/26)) s = String.fromCharCode(((col-1)%26) + 65) + s; return s; }
function fix_col(cstr) { return cstr.replace(/^([A-Z])/,"$$$1"); }
function unfix_col(cstr) { return cstr.replace(/^\$([A-Z])/,"$1"); }

function split_cell(cstr) { return cstr.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(","); }
function decode_cell(cstr) { var splt = split_cell(cstr); return { c:decode_col(splt[0]), r:decode_row(splt[1]) }; }
function encode_cell(cell) { return encode_col(cell.c) + encode_row(cell.r); }

SpreadsheetUtils = {
	encode_col: encode_col,
	encode_row: encode_row,
	encode_cell: encode_cell,
	// encode_range: encode_range,
	decode_col: decode_col,
	decode_row: decode_row,
	split_cell: split_cell,
	decode_cell: decode_cell,
	// decode_range: decode_range,
	// format_cell: format_cell,
	// get_formulae: sheet_to_formulae,
	// make_csv: sheet_to_csv,
	// make_json: sheet_to_json,
	// make_formulae: sheet_to_formulae,
	// sheet_to_csv: sheet_to_csv,
	// sheet_to_json: sheet_to_json,
	// sheet_to_formulae: sheet_to_formulae,
	// sheet_to_row_object_array: sheet_to_row_object_array
};
