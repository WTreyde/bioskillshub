// Prototype 2D method. Parameters must come from a reviewed configuration.
// Arguments are newline separated: nuclei, foci, output dir, image ID,
// threshold method, minimum area in pixels, prominence, watershed flag.
args = split(getArgument(), "\n");
if (args.length != 8) exit("Expected eight configured arguments.");
setBatchMode(true);
out = args[2] + "/";
File.makeDirectory(args[2]);
roiManager("reset");
open(args[0]);
rename("nuclear_source");
getDimensions(w, h, channels, slices, frames);
if (channels != 1 || slices != 1 || frames != 1) exit("Requires a 2D single-channel nuclear image.");
run("Set Scale...", "distance=0 known=0 pixel=1 unit=pixel");
run("Duplicate...", "title=nuclear_mask");
setAutoThreshold(args[4] + " dark");
setOption("BlackBackground", true);
run("Convert to Mask");
run("Fill Holes");
if (args[7] == "true") run("Watershed");
run("Analyze Particles...", "size=" + args[5] + "-Infinity show=Nothing exclude add");
n = roiManager("count");
saveAs("Tiff", out + args[3] + "_mask.tif");
if (n == 0) exit("No nuclei detected; inspect segmentation.");
roiManager("Save", out + args[3] + "_rois.zip");
selectImage("nuclear_source");
roiManager("Show All with labels");
run("Flatten");
saveAs("PNG", out + args[3] + "_overlay.png");
open(args[1]);
rename("foci_source");
getDimensions(fw, fh, fc, fs, ft);
if (fw != w || fh != h || fc != 1 || fs != 1 || ft != 1) exit("Foci image must match the 2D nuclear image dimensions.");
csv = "image_id,nucleus_id,foci_count\n";
for (i = 0; i < n; i++) {
    selectImage("foci_source");
    roiManager("select", i);
    run("Find Maxima...", "prominence=" + args[6] + " output=[Point Selection]");
    count = 0;
    if (selectionType() == 10) {
        getSelectionCoordinates(xpoints, ypoints);
        count = xpoints.length;
    }
    csv = csv + args[3] + "," + (i+1) + "," + count + "\n";
}
File.saveString(csv, out + args[3] + "_counts.csv");
File.saveString(getVersion(), out + args[3] + "_imagej_version.txt");
close("*");
setBatchMode(false);
