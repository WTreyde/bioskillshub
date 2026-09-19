---
name: imagej-foci
description: Guide nuclei segmentation and foci quantification with Fiji while retaining biological replicate structure.
---
# Nuclei segmentation and foci counting

Prototype: awaiting Leandre's protocol and reference images. Do not treat this as a validated analysis method.

## Use cases
Fluorescence images with a nuclear channel and a distinct foci channel. Determine the biological question before quantification. The included demonstration macro accepts paired 2D, single-channel images; other image types require an explicitly reviewed adaptation.

## Inputs
Paired nuclear and foci TIFFs, image identifiers, biological replicate IDs, condition labels, acquisition metadata, pixel calibration and a reviewed configuration. Ask the researcher whether images are 2D or stacks; do not silently project stacks. Confirm which channels encode nuclei and foci.

## Outputs
Nuclear ROI masks, overlays, per-nucleus foci counts, per-image summaries, per-biological-replicate summaries and descriptive plots. Keep excluded regions and exclusions documented. Record skill version, parameters, software versions and input hashes.

## Procedure
1. Obtain Leandre's reference protocol and populate a reviewed parameter file. Stop if it is missing. The synthetic fixture is only a software smoke test.
2. Inspect dimensions, calibration, saturation, illumination and signal-to-noise. Ask about acceptable exclusions.
3. Run Fiji using the reviewed preprocessing, threshold, particle-size and separation settings. Inspect overlays before accepting counts.
4. Detect foci within nuclear ROIs using the expert-approved definition. Keep zero-foci nuclei in the table.
5. Summarise with science/imagej/summarize.py, supplying image-to-condition and biological-replicate metadata. Do not treat nuclei as independent biological replicates.
6. Produce descriptive summaries first. Choose inferential tests only after the experimental design, pairing and sample size are confirmed by Leandre.

## Expert decisions
Request threshold strategy, background subtraction, minimum nuclear area and units, handling of touching or edge nuclei, foci prominence and minimum separation, and the treatment of diffuse signal. A local intensity maximum is not automatically a biological focus. Review difficult fields, not just clean examples. Never adjust parameters on held-out reference images to improve a benchmark.

## Limitations
No reference dataset or expert-approved parameters have yet been supplied. The generic macro does not establish biological accuracy. It is limited to 2D aligned images and peak counting; it is unsuitable for unreviewed 3D, overlapping foci or heterogeneous staining. No hypothesis test is selected by this prototype.

## Examples
First read docs/team/leandre.md and request the missing protocol information. Use science/imagej/config.synthetic.json only with generated synthetic fixtures. For real data, write a separate reviewed configuration and validate on Leandre's annotated images before making scientific claims.
