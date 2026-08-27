/*
 * HomeEasy · Hommy articulated source rig
 * Built and executed in Photopea. The official PNG is the only pixel source.
 * Canvas: 1254 x 1254. All exports retain the complete canvas alignment.
 */
try {
(function () {
  app.echoToOE('RIG_STEP:START');
  if (!app.documents.length) throw new Error('Open hommy-official.png before running this script.');

  var doc = app.activeDocument;
  app.echoToOE('RIG_STEP:DOC');
  app.echoToOE('RIG_STEP:SIZE');

  function polygon(points) {
    var result = [];
    for (var i = 0; i < points.length; i++) result.push([points[i][0], points[i][1]]);
    return result;
  }

  function selectMany(shapes) {
    doc.selection.deselect();
    for (var i = 0; i < shapes.length; i++) {
      doc.selection.select(polygon(shapes[i]), i === 0 ? SelectionType.REPLACE : SelectionType.EXTEND, 0, false);
    }
  }

  function duplicateKeep(reference, group, name, shapes) {
    var layer = reference.duplicate();
    layer.name = name;
    layer.visible = true;
    layer.move(group, ElementPlacement.INSIDE);
    doc.activeLayer = layer;
    selectMany(shapes);
    doc.selection.invert();
    doc.selection.clear();
    doc.selection.deselect();
    return layer;
  }

  function duplicateRemove(reference, group, name, shapes) {
    var layer = reference.duplicate();
    layer.name = name;
    layer.visible = true;
    layer.move(group, ElementPlacement.INSIDE);
    doc.activeLayer = layer;
    selectMany(shapes);
    doc.selection.clear();
    doc.selection.deselect();
    return layer;
  }

  function fillShapes(layer, shapes, hex) {
    var color = new SolidColor();
    color.rgb.hexValue = hex;
    doc.activeLayer = layer;
    selectMany(shapes);
    doc.selection.fill(color, ColorBlendMode.NORMAL, 100, false);
    doc.selection.deselect();
  }

  function value(unit) {
    return Number(unit && unit.value !== undefined ? unit.value : unit);
  }

  function rotateAround(layer, angle, pivotX, pivotY) {
    var b = layer.bounds;
    var cx = (value(b[0]) + value(b[2])) / 2;
    var cy = (value(b[1]) + value(b[3])) / 2;
    var radians = angle * Math.PI / 180;
    var rotatedX = cx + (pivotX - cx) * Math.cos(radians) - (pivotY - cy) * Math.sin(radians);
    var rotatedY = cy + (pivotX - cx) * Math.sin(radians) + (pivotY - cy) * Math.cos(radians);
    layer.rotate(angle, AnchorPosition.MIDDLECENTER);
    layer.translate(pivotX - rotatedX, pivotY - rotatedY);
  }

  function rotatePoint(point, pivot, angle) {
    var radians = angle * Math.PI / 180;
    var x = point[0] - pivot[0];
    var y = point[1] - pivot[1];
    return [
      pivot[0] + x * Math.cos(radians) - y * Math.sin(radians),
      pivot[1] + x * Math.sin(radians) + y * Math.cos(radians)
    ];
  }

  var headShape = [[294,147],[337,73],[470,27],[720,24],[840,76],[902,168],[916,301],[879,427],[802,513],[714,554],[521,555],[403,526],[331,460],[295,365]];
  var upperArmShape = [[305,582],[394,571],[455,615],[468,690],[447,758],[421,821],[370,884],[258,875],[225,817],[238,733],[269,680]];
  var forearmShape = [[228,796],[375,796],[389,918],[380,1105],[347,1150],[222,1148],[186,1095],[183,950],[203,852]];
  var idleHandShape = [[212,1074],[354,1074],[392,1118],[416,1186],[416,1254],[192,1254],[186,1174]];
  var tabletShape = [[938,689],[1168,692],[1188,735],[1163,784],[1059,920],[1017,947],[870,946],[827,904],[845,845],[900,759]];
  var leftEye = [[516,311],[533,293],[560,286],[586,298],[600,322],[598,356],[583,383],[556,392],[530,382],[513,358],[507,332]];
  var rightEye = [[680,312],[696,294],[723,289],[749,302],[762,326],[759,359],[742,386],[716,392],[691,381],[676,356],[673,330]];
  var leftEyePatch = [[503,302],[525,281],[559,276],[593,288],[611,316],[610,362],[589,395],[554,405],[520,393],[499,363],[495,329]];
  var rightEyePatch = [[666,301],[689,281],[724,278],[757,291],[774,319],[772,365],[750,398],[715,404],[682,392],[662,362],[660,327]];
  var shoulderBacking = [[326,625],[344,612],[367,612],[389,625],[401,650],[400,680],[385,701],[360,710],[338,700],[323,681],[319,652]];
  var torsoBacking = [[344,648],[394,602],[449,609],[482,658],[480,778],[455,879],[406,915],[362,866],[347,770]];

  var neckPivot = [625,548];
  var shoulderPivot = [337,681];
  var elbowPivot = [279,864];
  var wristPivot = [278,1110];
  var headAngle = 4;
  var shoulderAngle = -80;
  var elbowAngle = 15;
  var wristAngle = -5;

  var reference = doc.activeLayer;
  app.echoToOE('RIG_STEP:REFERENCE');
  reference.name = '00_REFERENCE_LOCKED';
  reference.visible = true;
  app.echoToOE('RIG_STEP:REFERENCE_NAMED');

  function buildPose(name, contact) {
    var group = doc.layerSets.add();
    group.name = name;
    var prefix = contact ? 'CONTACT__' : '';
    app.echoToOE('RIG_STEP:' + name + ':GROUP');

    var body = duplicateRemove(reference, group, prefix + '10_BODY_CLEAN', [headShape, upperArmShape, forearmShape, idleHandShape]);
    app.echoToOE('RIG_STEP:' + name + ':BODY');
    fillShapes(body, [torsoBacking], '6A2034');
    fillShapes(body, [shoulderBacking], '35151F');

    var faceClean = group.artLayers.add();
    faceClean.name = prefix + '22_FACE_SCREEN_CLEAN';
    fillShapes(faceClean, [leftEye, rightEye], '15120F');

    var head = duplicateKeep(reference, group, prefix + '20_HEAD', [headShape]);
    app.echoToOE('RIG_STEP:' + name + ':HEAD');

    var eyes = duplicateKeep(reference, group, prefix + '21_EYES', [leftEye, rightEye]);
    app.echoToOE('RIG_STEP:' + name + ':EYES');
    var upper = duplicateKeep(reference, group, prefix + '30_FREE_UPPER_ARM', [upperArmShape]);
    var forearm = duplicateKeep(reference, group, prefix + '31_FREE_FOREARM', [forearmShape]);
    var idleHand = duplicateKeep(reference, group, prefix + '32_FREE_HAND_IDLE', [idleHandShape]);
    var tapHand = duplicateKeep(reference, group, prefix + '33_FREE_HAND_TAP', [idleHandShape]);
    var tablet = duplicateKeep(reference, group, prefix + '40_TABLET_FOREGROUND', [tabletShape]);
    app.echoToOE('RIG_STEP:' + name + ':PARTS');

    idleHand.visible = !contact;
    tapHand.visible = contact;
    faceClean.visible = false;
    eyes.visible = false;

    if (contact) {
      rotateAround(head, headAngle, neckPivot[0], neckPivot[1]);

      var movedElbow = rotatePoint(elbowPivot, shoulderPivot, shoulderAngle);
      var movedWrist = rotatePoint(wristPivot, shoulderPivot, shoulderAngle);
      movedWrist = rotatePoint(movedWrist, movedElbow, elbowAngle);

      rotateAround(upper, shoulderAngle, shoulderPivot[0], shoulderPivot[1]);

      rotateAround(forearm, shoulderAngle, shoulderPivot[0], shoulderPivot[1]);
      rotateAround(forearm, elbowAngle, movedElbow[0], movedElbow[1]);

      rotateAround(tapHand, shoulderAngle, shoulderPivot[0], shoulderPivot[1]);
      rotateAround(tapHand, elbowAngle, movedElbow[0], movedElbow[1]);
      rotateAround(tapHand, wristAngle, movedWrist[0], movedWrist[1]);

      idleHand.visible = false;
    }

    tablet.move(group, ElementPlacement.PLACEATBEGINNING);
    return group;
  }

  var idle = buildPose('POSE_IDLE', false);
  var contact = buildPose('POSE_CONTACT', true);
  contact.visible = false;
  idle.visible = true;
  reference.visible = false;
  reference.allLocked = true;
  doc.activeLayer = idle;
  doc.selection.deselect();
  app.echoToOE('RIG_STEP:FINISH');
})();
} catch (error) {
  app.echoToOE('RIG_ERROR:' + String(error && error.message ? error.message : error));
}
