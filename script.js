// - setup
var target = 100;
var $word_field = $('#word-field');
var $result_area = $('#result-area');
var $word_length = $('#word-length');
var $tip = $('#tip');
var $score_table = $('#score-table');
var $word_bank = $('#word-bank');
var $word_bank_ul = $word_bank.find('ul');
var letter_values = {
  'a' : 1,
  'b' : 2,
  'c' : 3,
  'd' : 4,
  'e' : 5,
  'f' : 6,
  'g' : 7,
  'h' : 8,
  'i' : 9,
  'j' : 10,
  'k' : 11,
  'l' : 12,
  'm' : 13,
  'n' : 14,
  'o' : 15,
  'p' : 16,
  'q' : 17,
  'r' : 18,
  's' : 19,
  't' : 20,
  'u' : 21,
  'v' : 22,
  'w' : 23,
  'x' : 24,
  'y' : 25,
  'z' : 26
};
var word_bank = [];
var word, score, i, points, score_formatted, score_table, tip;

// - triggers
$('form').on('submit', function(){
  return false;
});

$word_field.on('keyup change blur', function() {
  score = 0;
  word = $word_field.val().toLowerCase();
  letters = word.split('');

  score_table = '<table><thead><tr><th>Letter</th><th>Value</th></tr></thead><tbody>';

  for (i in letters) {
    if (letter_values[letters[i]] !== undefined) {
      points = letter_values[letters[i]];
      score += points;
      score_table += '<tr><td>'+letters[i]+'</td><td>$'+(points/100).toFixed(2)+'</td>'
      }
  }

  score_formatted = (score/100).toFixed(2);
  $word_length.html('$'+score_formatted);

  tip = '';
  if (score == target) {
    $result_area.attr('class', 'good');
    tip = "You're fabulous!";
    if ($.inArray(word, word_bank) === -1) {
      word_bank.push(word);
      $word_bank_ul.append('<li>'+word+'</li>');
      $word_bank.show();
    }
  } else {
    $result_area.attr('class', 'bad');
    if (score < target) {
      tip = "You're not quite there yet!";
    } else {
      tip = "You've gone over!";
    }
  }

  $tip.html(tip);

  score_table += '</tbody><tfoot><tr><td>Total</td><td>$'+score_formatted+'</td></tr></tfoot></table>';
  $score_table.html(score_table);

  if (score > 0) {
    $result_area.slideDown();
  } else {
    $result_area.slideUp();
  }
});
