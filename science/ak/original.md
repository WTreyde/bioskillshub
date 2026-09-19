# ML for Chemical Reaction Prediction — Practitioner's Workflow

> A practitioner-oriented guide to building machine-learning models that predict whether a chemical reaction will work. Focuses on the decisions documentation misses: representation choices, data pitfalls, evaluation traps, and how to frame the output so chemists actually use it.

---

## 1. Choose Your Molecular Representation

This is the first and most consequential decision. Everything downstream depends on it.

### Representation families

| Approach | When to consider | Trade-offs |
|---|---|---|
| **Graph-based** (molecular graphs, GNNs) | Large datasets; want the model to learn its own features | Needs lots of data; harder to interpret |
| **Vector-based** (fingerprints, descriptors) | Small–medium datasets; want interpretability | Requires domain choices up front; may miss patterns you didn't encode |
| **Deep learning** | Thousands of data points or more | Powerful but data-hungry and opaque |
| **Shallow learning** (RF, SVM, XGBoost, etc.) | Fewer data points; want fast iteration | More reliant on good feature engineering |

**Rule of thumb:** the amount of data you have should inform whether you go deep or shallow.

### Vector encoding decisions

If you go the vector route, decide on the nature of your encoding:

- **Binary** — presence/absence (e.g., substructure keys)
- **Continuous** — real-valued descriptors (e.g., logP, molecular weight, DFT-derived properties)
- **Mixed** — a combination of both (common in practice)

---

## 2. Featurisation — What to Encode

### Out-of-the-box molecular fingerprints and descriptors

- **MACCS keys** — 166-bit structural keys; simple, interpretable
- **Morgan fingerprints** (ECFP) — circular fingerprints; tuneable radius and bit length
- **RDKit fingerprints** — path-based; good general-purpose option
- **Functional-group flags** — presence/absence of specific functional groups relevant to your reaction

There are broadly **two types of fingerprints**: substructure-key-based (fixed dictionary) and hashed/circular (algorithmically generated). Understand which you're using and why.

### 3D descriptors — proceed with caution

- Consider how conformationally flexible your system is.
- If you include 3D descriptors, you need to generate conformers — at what level of theory?
- Higher levels of theory (e.g., DFT) add **significant computational cost**.
- **Caution:** some studies show that 3D descriptors make predictions *worse* by introducing noise, especially for flexible molecules where the "correct" conformer is ambiguous.

### Expert-informed descriptors

- **Less data → lean more on expert-encoded features.** When you don't have thousands of data points, hand-crafted descriptors informed by domain knowledge often outperform learned ones.
- Read the literature on your specific reaction. What factors are already known to matter (steric bulk at a specific site, electronics of substituents, solvent properties, temperature ranges)?
- Consider DFT-derived descriptors for small datasets — they encode physics the model can't learn from limited examples.

### Automating from SMILES

- Build a pipeline that goes from SMILES strings → computed descriptors.
- This makes the workflow reproducible and avoids manual encoding errors.

---

## 3. Data Structures

- **JSONs work well** for storing molecular data because they naturally handle:
  - **Whole-molecule descriptors** (molecular weight, total polar surface area, fingerprints, etc.)
  - **Atom-specific descriptors** (partial charges, NMR shifts, local environment features)
- The nested format of JSON accommodates both levels cleanly, with atom-level data nested under each molecule record.

---

## 4. Classification Over Regression

This is a strong recommendation from practice:

- **Regression on yield is extremely difficult.** Yield data is noisy, highly dependent on experimental conditions that may not be captured in your features, and spans a messy continuum.
- **Classification (works / doesn't work) is more tractable and more useful.**
- A useful middle-ground approach: **train a regression model, then classify based on the regression output.** This way the model sees more information during training (continuous yield values) but your final evaluation is on the binary outcome.

### Why binary classification aligns with chemistry

> The general knowledge in chemistry is that it's quite hard to go from *no yield* to *some yield*, but then it's "just" optimisation to get from some yield to enough yield.

The critical question is the binary one: *will this reaction work at all?* Once you know it does, the chemist can optimise conditions. The model's highest-value contribution is that yes/no call.

---

## 5. Data Hygiene and the Negative-Data Problem

### Data quality is paramount

- Experimental data requires **extremely high hygiene standards.** Clean your data ruthlessly — inconsistent conditions, ambiguous outcomes, and duplicates will poison your model.
- Scrutinise every data point. If you can't trace a result back to a reliable experiment, consider dropping it.

### The success bias

- Published and internal experimental data is **massively biased toward positive results.** Failed reactions are under-reported.
- This means you're missing the negative examples you need to do good classification.

### Strategies for the data gap

- **Positive-unlabeled (PU) learning** — an emerging approach that treats your negative class as "unlabeled" rather than truly negative, since some of those "failures" may just not have been attempted. Worth investigating.
- **Synthetic data generation** — consider whether you can generate plausible negative examples by encoding chemical knowledge about what should *not* work (e.g., incompatible functional groups, thermodynamically disfavoured transformations).

---

## 6. Data Leakage — The Cardinal Sin

> You cannot, under any circumstances, give the model the mark scheme before it sits the test.

### Direct leakage

- Scaling, normalisation, or any preprocessing must be fitted on the training fold only, then applied to the test fold.
- Target leakage (features that encode the outcome) must be hunted for and eliminated.

### Indirect leakage

- Leakage can happen **indirectly** — through features that are proxies for the target, through data points that share information across train/test splits (e.g., very similar molecules or the same molecule under trivially different conditions), or through preprocessing steps that see the full dataset.
- This is not obvious and requires careful thought. The consequence is an **inflated sense of model performance** that collapses on truly unseen data.

### Splitting must match your representation

- **Split your data using the same representation you'll train and evaluate on.** If you plan to train on Morgan fingerprints, split on Morgan fingerprints.
- **Do not** split on Murcko scaffolds and then train/test on a different representation. The split is supposed to ensure the model is tested on genuinely different chemistry — if the split metric and the model metric don't align, the split is meaningless.

---

## 7. Model Evaluation

### Baseline-corrected metrics

- Pick your metric (e.g., accuracy, F1, MCC, AUROC).
- **Evaluate as percentage improvement over a random classifier that respects your class imbalance.** If you have 80% positives, a model that always predicts positive gets 80% accuracy — that's your floor, not your benchmark. Report how much better your model is than this floor.

### Cross-validation

- Use **5-fold cross-validation** or **5-fold nested cross-validation** (nested if you're also doing hyperparameter tuning).
- Apply **statistical testing** to your fold results — don't just report the mean; report variability and test whether differences between models are significant.

### Watch your fold sizes

- Track the size of each fold. If your dataset is small, folds can become tiny, and performance estimates become unreliable.

---

## 8. Interpretation

- Use feature-importance methods (SHAP, permutation importance, etc.) to understand **what drove the model's decisions**.
- Interpretation isn't just for publication — it's a **practical feedback loop:**
  - It can reveal features you're missing that the model is trying to approximate through correlated proxies.
  - It tells the chemist *why* the model thinks a reaction will or won't work, which is far more useful than a bare prediction.

---

## 9. Framing the Output — Decision Support, Not an Oracle

> It should be viewed as a decision support tool — giving chemists more information with which to make decisions.

- The model output is **not** a perfectly predictive oracle. Do not present it as one.
- It **should not** be a black box. The chemist should see *why* the model is predicting what it predicts.
- The ideal output is: "Here is additional information about the chemistry of your system, and here is how you might change it so the reaction might work."
- Frame predictions alongside the evidence and reasoning. This builds trust and makes the tool actually useful in practice.

---

## Quick-Reference Checklist

- [ ] Representation chosen (graph vs. vector, deep vs. shallow) based on dataset size
- [ ] Featurisation pipeline built from SMILES, with domain-informed descriptor choices
- [ ] 3D descriptors included only if justified and validated (not just "because we can")
- [ ] Data stored in structured JSON with molecule-level and atom-level descriptors
- [ ] Classification framing (possibly regression → classification)
- [ ] Data cleaned to high hygiene standards
- [ ] Negative-data gap addressed (PU learning, synthetic negatives, or acknowledged)
- [ ] No data leakage — preprocessing fitted on train only, split matches representation
- [ ] Evaluation baseline-corrected for class imbalance
- [ ] Cross-validation with statistical testing and tracked fold sizes
- [ ] Model interpretation implemented and presented alongside predictions
- [ ] Output framed as decision support for chemists, not a black-box oracle
