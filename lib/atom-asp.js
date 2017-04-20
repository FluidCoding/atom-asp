'use babel';

import AtomAspView from './atom-asp-view';
import { CompositeDisposable } from 'atom';

export default {

  atomAspView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomAspView = new AtomAspView(state.atomAspViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomAspView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-asp:htmlToAsp': () => this.htmlSelectionToASP()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-asp:sqlToStr': () => this.sqlSelectionConcatStr()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-asp:aspMergeLines': () => this.aspSelectionMergeLines()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomAspView.destroy();
  },

  serialize() {
    return {
      atomAspViewState: this.atomAspView.serialize()
    };
  },

  htmlToAsp(html, trim, preserveLnBr){
    let outAsp = "";
    const htmlLines = html.replace(/"/g, "\"\"")
    .split(/\r?\n/);
    htmlLines.forEach((line) => {
      if(line !== ""){
        outAsp += "Response.Write \"" + (trim ? line.trim() : line) + "\"";
        if(preserveLnBr) outAsp += " & vbCrLf";
        outAsp += "\n";
      }
    });
    return outAsp;
  },
  // @TODO: Add paramater extracting syntax (i.e. {I_ID} => " & I_ID "), w. str working & "'"
  sqlToStr(sql, preserveLnBr=false){
    let outStr = "";//.replace(/"/g, "\"\"")
    const sqlLines = sql.split(/\r?\n/);
    sqlLines.forEach((line) => {
      if (line !== ""){
        outStr += "SQLStr = SQLStr & \"" + line + " \"";
        if(preserveLnBr) outAsp += " & vbCrLf";
        outStr += "\n";
      }
    });
    return outStr;
  },

  aspMergeLines(asp){
    let outStr = "";//.replace(/"/g, "\"\"")
    const aspLines = asp.split(/\r?\n/);
      for(let i = 0; i < aspLines.length-1; i++){
        if(aspLines[i] !== "")
          outStr += aspLines[i] + " : ";
      }

    return outStr;
  },

  convert(){
    const addCrLf = document.getElementById("br").checked;
    const trim = document.getElementById("tr").checked;
    const input = document.getElementById('inputHTML').value;
    const output =  htmlToAsp(input, trim, addCrLf);
    if(output !== "") document.getElementById('outputASP').value = output;
  },

  htmlSelectionToASP(){
    const editor = atom.workspace.getActiveTextEditor();
    editor.selectLinesContainingCursors();
    const selectedHTMLRange = editor.getSelectedBufferRange();
    const selectedHTMLText = editor.getSelectedText();
    atom.workspace.getActiveTextEditor().setTextInBufferRange(selectedHTMLRange, this.htmlToAsp(selectedHTMLText, false, true));
  },

  sqlSelectionConcatStr(){
    const editor = atom.workspace.getActiveTextEditor();
    editor.selectLinesContainingCursors();
    const selectedSQLRange = editor.getSelectedBufferRange();
    const selectedSQLText = editor.getSelectedText();
    atom.workspace.getActiveTextEditor().setTextInBufferRange(selectedSQLRange, this.sqlToStr(selectedSQLText));
  },

  aspSelectionMergeLines(){
    const editor = atom.workspace.getActiveTextEditor();
    editor.selectLinesContainingCursors();
    const selectedHTMLRange = editor.getSelectedBufferRange();
    const selectedHTMLText = editor.getSelectedText();
    console.log(this.aspMergeLines(selectedHTMLText));
    atom.workspace.getActiveTextEditor().setTextInBufferRange(selectedHTMLRange, this.aspMergeLines(selectedHTMLText));
  }

};
