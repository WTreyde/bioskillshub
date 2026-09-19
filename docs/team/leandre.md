# Leandre — ImageJ case study and expert skill

You own scientific validity of the microscopy demonstration. Your first task is to elaborate your existing ImageJ GUI + Excel workflow, not to adopt the prototype's generic parameters.

## Answer these questions in a private working document, then commit the non-confidential protocol

1. What biological question does foci counting answer? What are the stains/markers and conditions? What is a biological focus in this assay?
2. Can you provide a small shareable dataset today? State permission/licence, file formats, image size, channel ordering, pixel size, bit depth and whether data are 2D, z-stacks or time series. Keep private images outside Git.
3. Walk through the exact Fiji/ImageJ menu commands. Use Plugins → Macros → Record if convenient. Include software/plugin versions and all settings. Explain why you chose each non-obvious parameter.
4. How do you correct background, illumination and noise? What constitutes saturation or an unusable field?
5. How do you threshold and separate nuclei? Specify size units, touching-nucleus rules, edge exclusions and manual corrections.
6. How do you identify foci? Specify prominence, size/separation, intranuclear inclusion, diffuse signal treatment, overlapping foci and zero-count cells.
7. Which images can you annotate as references? Provide nuclear masks/ROIs and per-nucleus foci counts, including difficult cases. Identify development images separately from held-out evaluation images.
8. What exactly did you calculate in Excel? Provide column meanings, formulas, aggregation, plots and any statistical tests.
9. What is the independent biological replicate: donor, culture, experiment or something else? Which observations are paired? How many replicates and fields per condition? How are exclusions documented?
10. What constitutes an acceptable result? Define mask/count tolerances and quality checks before evaluating the agent. A successful command is not proof of an accurate count.

## Deliverables

- Reviewed protocol and parameter file, dataset manifest and frozen reference annotations.
- A revised science/imagej/SKILL.md containing your actual expert decisions and scope.
- Validate the prototype Fiji macro or replace its segmentation/peak detection steps with your approved method. Do not silently turn the sample thresholds into a scientific protocol.
- Run descriptive summaries and inspect labelled overlays. Select inference only after the design supports it.
- Record baseline and skill-assisted runs under the same tools/model/data/budget. Save time, errors and objective output quality; retain failures.
- Supply one clear before/after image and an evidence statement to Maxim. If there is no improvement, say so.

The web creator form supports guided generation and Markdown upload. Generated wording is a draft for your review. The initial catalogue entry says validation is pending; update that status only after you have evidence.
