# ImageJ prototype runner

The sample method segments a nuclear image and counts local intensity maxima inside each ROI. **It is not Leandre's validated method.** It only accepts aligned 2D single-channel images, excludes edge nuclei and uses pixel-area thresholds. Masks contain thresholded regions, while the ROI archive records accepted nuclei. Overlay labels correspond to the counts CSV.

For Fiji, set FIJI_BIN to the installed launcher and run science/imagej/run.py. Review plugin/headless compatibility. For a small reproducible core-ImageJ smoke test (not a full Fiji distribution):

```sh
python3 science/imagej/synthetic.py results/synthetic-input
docker build -f science/imagej/Dockerfile -t bioskills-imagej-core .
docker run --rm -v "$PWD:/workspace" bioskills-imagej-core --nuclei results/synthetic-input/nuclei.pgm --foci results/synthetic-input/foci.pgm --image-id synthetic --config science/imagej/config.synthetic.json --synthetic --output results/synthetic-output
python3 science/imagej/summarize.py results/synthetic-output/synthetic_counts.csv results/synthetic-input/metadata.csv --output results/synthetic-summary
```

Expected synthetic counts, sorted: 0, 2, 3. Fixture IDs are not independent biological replicates. Do not infer scientific accuracy from this smoke test. For real data, follow docs/team/leandre.md, provide a reviewed configuration, validate on held-out references and retain the actual Fiji version in the manifest. The summary utility intentionally does not run significance tests.

Before real-data evaluation, complete `dataset.example.json` privately and run `python3 science/imagej/preflight.py PRIVATE_MANIFEST.json`. See [scientific intake](../../docs/scientific-intake.md).
