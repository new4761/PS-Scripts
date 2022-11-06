#target photoshop
app.bringToFront();

main();
function main(){
if(!documents.length){
    alert("You need to have at least one document open!");
    return;
}
var win = new Window( 'dialog', 'RA' ); 
g = win.graphics;
var myBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.99, 0.99, 0.99, 1]);
g.backgroundColor = myBrush;
win.orientation='stack';

win.p1= win.add("panel", undefined, undefined, {borderStyle:"black"}); 
win.g1 = win.p1.add('group');
win.g1.orientation = "row";
win.title = win.g1.add('statictext',undefined,'Run Action(s)');
win.title.alignment="fill";

var g = win.title.graphics;
g.font = ScriptUI.newFont("Georgia","BOLDITALIC",22);
win.p1.p1= win.p1.add("panel", undefined, undefined, {borderStyle:"black"}); 
win.p1.p1.preferredSize=[300,2];

win.g6 =win.p1.add('group');
win.g6.orientation = "row";
win.g6.alignment='fill';
win.g6.spacing=10;
win.g6.cb1 = win.g6.add('checkbox',undefined,'Run Action(s) On Selected Layer(s)');
win.g6.cb1.value=true;

win.p1.p2= win.p1.add("panel", undefined, undefined, {borderStyle:"black"}); 
win.p1.p2.preferredSize=[300,2];
win.g10 =win.p1.add('group');
win.g10.orientation = "row";
win.g10.alignment='fill';
win.g10.spacing=10;
win.g10.dd1 = win.g10.add('dropdownlist');
win.g10.dd2 = win.g10.add('dropdownlist');
win.g15 =win.p1.add('group');
win.g15.orientation = "row";
win.g15.alignment='fill';
win.g15.spacing=10;
win.g15.st1 = win.g15.add('statictext',undefined,'Selected Actions');
win.g15.et1 = win.g15.add('edittext',undefined,'0');
win.g15.et1.preferredSize=[40,20];
win.g15.et1.enabled=false;
win.g15.bu1 = win.g15.add('button',undefined,'Add Action');
win.g15.bu2 = win.g15.add('button',undefined,'Remove Action');
win.p1.p3= win.p1.add("panel", undefined, undefined, {borderStyle:"black"}); 
win.p1.p3.preferredSize=[300,2];
win.g20 =win.p1.add('group');
win.g20.orientation = "row";
win.g20.alignment='center';
win.g20.spacing=10;
win.g20.bu1 = win.g20.add('button',undefined,'Process');
win.g20.bu1.preferredSize=[170,35];
win.g20.bu2 = win.g20.add('button',undefined,'Cancel');
win.g20.bu2.preferredSize=[170,35];

var actionSets = new Array();
actionSets = getActionSets();
for (var i=0,len=actionSets.length;i<len;i++) {
	win.g10.dd1.add ('item', "" + actionSets[i]);      
}; 
win.g10.dd1.selection=0;

var actions = new Array();	
actions = getActions(actionSets[0]);
for (var i=0,len=actions.length;i<len;i++) {
	win.g10.dd2.add ('item', "" + actions[i]);      
};
win.g10.dd2.selection=0;

win.g10.dd1.onChange = function() {
win.g10.dd2.removeAll();
actions = getActions(actionSets[parseInt(this.selection)]);
for (var i=0,len=actions.length;i<len;i++) {
	win.g10.dd2.add ('item', "" + actions[i]);  
	}
	win.g10.dd2.selection=0;
};
actionArray=[];
win.g15.bu1.onClick = function() {
	actionArray.push([[win.g10.dd2.selection.text],[win.g10.dd1.selection.text]]);
	win.g15.et1.text = actionArray.length;
}
win.g15.bu2.onClick = function() {
	actionArray.pop();
	win.g15.et1.text = actionArray.length;
}
win.g20.bu1.onClick=function(){
if(actionArray.length ==0) actionArray.push([[win.g10.dd2.selection.text],[win.g10.dd1.selection.text]]);
win.close(1);
var selectedLayers= getSelectedLayersIdx();
// var selectedLayers = SelectedLayers();
for(var a in selectedLayers){
    makeActiveByIndex(Number(selectedLayers[a]));
     if(app.activeDocument.activeLayer.kind != LayerKind.GROUP) continue;
     for(var z in actionArray){
         try{
         doAction(actionArray[z][0].toString(), actionArray[z][1].toString());	
         }catch(e){alert(e+" - "+e.line);}
         }
    }

};
win.center();
win.show();

function getActionSets() { 
cTID = function(s) { return app.charIDToTypeID(s); }; 
sTID = function(s) { return app.stringIDToTypeID(s); }; 
  var i = 1; 
  var sets = [];  
  while (true) { 
    var ref = new ActionReference(); 
    ref.putIndex(cTID("ASet"), i); 
    var desc; 
    var lvl = $.level; 
    $.level = 0; 
    try { 
      desc = executeActionGet(ref); 
    } catch (e) { 
      break;   
    } finally { 
      $.level = lvl; 
    } 
    if (desc.hasKey(cTID("Nm  "))) { 
      var set = {}; 
      set.index = i; 
      set.name = desc.getString(cTID("Nm  ")); 
      set.toString = function() { return this.name; }; 
      set.count = desc.getInteger(cTID("NmbC")); 
      set.actions = []; 
      for (var j = 1; j <= set.count; j++) { 
        var ref = new ActionReference(); 
        ref.putIndex(cTID('Actn'), j); 
        ref.putIndex(cTID('ASet'), set.index); 
        var adesc = executeActionGet(ref); 
        var actName = adesc.getString(cTID('Nm  ')); 
        set.actions.push(actName); 
      } 
      sets.push(set); 
    } 
    i++; 
  } 
  return sets; 
}; 

function getActions(aset) {
cTID = function(s) { return app.charIDToTypeID(s); }; 
sTID = function(s) { return app.stringIDToTypeID(s); };
  var i = 1;
  var names = [];
  if (!aset) {
    throw "Action set must be specified";
  }  
  while (true) {
    var ref = new ActionReference();
    ref.putIndex(cTID("ASet"), i);
    var desc;
    try {
      desc = executeActionGet(ref);
    } catch (e) {
      break;
    }
    if (desc.hasKey(cTID("Nm  "))) {
      var name = desc.getString(cTID("Nm  "));
      if (name == aset) {
        var count = desc.getInteger(cTID("NmbC"));
        var names = [];
        for (var j = 1; j <= count; j++) {
          var ref = new ActionReference();
          ref.putIndex(cTID('Actn'), j);
          ref.putIndex(cTID('ASet'), i);
          var adesc = executeActionGet(ref);
          var actName = adesc.getString(cTID('Nm  '));
          names.push(actName);
        }
        break;
      }
    }
    i++;
  }
  return names;
};

function hasLayerMask() { 
   var ref = new ActionReference(); 
   ref.putEnumerated( stringIDToTypeID( "layer" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" )); 
   var Mask= executeActionGet( ref ); 
   return Mask.hasKey(charIDToTypeID('Usrs')); 
};

function getSelectedLayersIdx(){ 
      var selectedLayers = new Array; 
      var ref = new ActionReference(); 
      ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
      var desc = executeActionGet(ref); 
      if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){ 
         desc = desc.getList( stringIDToTypeID( 'targetLayers' )); 
          var c = desc.count 
          var selectedLayers = new Array(); 
          for(var i=0;i<c;i++){ 
            try{ 
               activeDocument.backgroundLayer; 
               selectedLayers.push(  desc.getReference( i ).getIndex() ); 
            }catch(e){ 
               selectedLayers.push(  desc.getReference( i ).getIndex()+1 ); 
            } 
          } 
       }else{ 
         var ref = new ActionReference(); 
         ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" )); 
         ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
         try{ 
            activeDocument.backgroundLayer; 
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1); 
         }catch(e){ 
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))); 
         } 
      } 
      return selectedLayers; 
 };

function makeActiveByIndex( idx, visible,add ){ 
    if(visible == undefined) visible = false;
    if(add == undefined) add=false;
    var desc = new ActionDescriptor(); 
      var ref = new ActionReference(); 
      ref.putIndex(charIDToTypeID( "Lyr " ), idx) 
      desc.putReference( charIDToTypeID( "null" ), ref ); 
      if(add) desc.putEnumerated(stringIDToTypeID('selectionModifier'), stringIDToTypeID('selectionModifierType'), stringIDToTypeID('addToSelection'));
      desc.putBoolean( charIDToTypeID( "MkVs" ), visible ); 
   executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO ); 
};


function SelectedLayers() {
	try{
		var ActLay = app.activeDocument.activeLayer;
		ActLay.allLocked = true; //lock all selected layers
		var LayerStack = app.activeDocument.artLayers.length;

		var selLayers = new Array();
		for(var i = 0; i <= LayerStack - 1; i++) {
			ActLay = app.activeDocument.layers[i]
			if (ActLay.allLocked == true) {selLayers.push(app.activeDocument.layers[i]);} // push all locked layers into an array
		}

		for (i = 0; i <= LayerStack - 1; i++) {
			var LAY = app.activeDocument.layers[i];
			LAY.allLocked = false; // unlock all locked Layers
		}

		return selLayers;
	}
	catch(e){/*alert(e);*/}
}

SelectedLayers()
}