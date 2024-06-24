/* 
 * Copyright (c) 2022 Ryan Marina
 * Licensed under the AGPL
 * See LICENSE.html for details.
*/

var ui = SpreadsheetApp.getUi();

function getElems() {
  var sheetCtx = SpreadsheetApp.getActiveSheet();
  var data = sheetCtx.getDataRange().getValues();
  var arr = []
  for(var i = 0; i < data.length; i++) {
    /* check:
     *
     * - that there are more than two entries
     * - the first two (key and value) are non-empty
     * 
     * TODO: provide warning for keys where key == 'question'
     * and value == 'answer', or some combination thereof
    */
    if(
      data[i].length >= 2 &&
      data[i][0] != "" &&
      data[i][1] != ""
    ) {
      arr.push([...data[i].slice(0, 2), i + 1]);
    }


  }
  /* shuffle array */
  arr = arr.sort((a, b) => 0.5 - Math.random());

  return arr;
}

function quizLoop(data) {
  var total = 0,
    correct = 0,
    ss = SpreadsheetApp.getActiveSpreadsheet();

  for(var i = 0; i < data.length; i++) {
    total += 1

    var response = ui.prompt("Quiztool", data[i][0], ui.ButtonSet.YES_NO);

    if(response.getSelectedButton() == ui.Button.YES && response.getResponseText() != data[i][1]) {
      response = ui.alert(
        "Quiztool",
        "The answer you entered does not exactly match the correct answer, " + data[i][1] + ". Is it correct?",
        ui.ButtonSet.YES_NO
      );

      if(response == ui.Button.YES) {
        correct += 1;
      } else if(response == ui.Button.NO) {
        var location = ss.getRange("C" + data[i][2].toString())
        var number = Number(location.getValue())
        if(isNaN(number)) {
          location.setValue(1)
        } else {
          location.setValue(number + 1)
        }
      }
      continue;
    } else if(response.getSelectedButton() == ui.Button.YES && response.getResponseText() == data[i][1]) {
      ui.alert(
        "Quiztool",
        "You got it right!",
        ui.ButtonSet.OK
      );

      correct += 1;
      continue;
    } else if(response.getSelectedButton() == ui.Button.NO) {
      total -= 1;

      ui.alert(
        "Quiztool",
        "correct/total == " + correct.toString() + "/" + total.toString() +
        " (" + (Math.floor((correct / total) * 100)).toString() + "%)",
        ui.ButtonSet.OK
      );
      break;
    }
  }
}

function quizWrapper() {
  vals = getElems()
  quizLoop(vals)
}

function helpWrapper() {
  html = HtmlService.createHtmlOutputFromFile('README.html')
    .setTitle("Quiztool");
  ui
    .showSidebar(html);
}

function licenseWrapper() {
  html = HtmlService.createHtmlOutputFromFile('LICENSE.html')
    .setTitle("Quiztool");
  ui
    .showSidebar(html);
}

function nop() {
  return null;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Quiztool")
    .addItem("Quiz", "quizWrapper")
    .addSeparator()
    .addItem("Read Me!", "helpWrapper")
    .addItem("License", "licenseWrapper")
    .addToUi();
}
