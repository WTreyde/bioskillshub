import hashlib,importlib.util,json,tempfile,pathlib,unittest
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
summary=module('summary','science/imagej/summarize.py')
admet=module('admet','science/admet/preflight.py')
class ScienceTests(unittest.TestCase):
    def test_replicate_aggregation_and_zero_foci(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d);(p/'counts.csv').write_text('image_id,nucleus_id,foci_count\na,1,0\na,2,4\nb,1,2\n');(p/'meta.csv').write_text('image_id,replicate_id,condition\na,r1,control\nb,r1,control\n')
            rows=summary.summarise(p/'counts.csv',p/'meta.csv',p/'out');self.assertEqual(len(rows),1);self.assertEqual(rows[0]['mean_foci'],2);self.assertEqual(rows[0]['nuclei'],3)
    def test_missing_images_fail(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d);(p/'counts.csv').write_text('image_id,nucleus_id,foci_count\na,1,0\n');(p/'meta.csv').write_text('image_id,replicate_id,condition\na,r1,control\nb,r2,control\n')
            with self.assertRaisesRegex(ValueError,'without counts'):summary.summarise(p/'counts.csv',p/'meta.csv',p/'out')
    def test_admet_checkpoint_provenance_and_tampering(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)
            checkpoint=b'synthetic checkpoint; not a scientific model'*(30000)
            (p/'checkpoint.bin').write_bytes(checkpoint)
            (p/'inputs.csv').write_text('molecule_id,smiles\nm1,CCO\n')
            (p/'expected.csv').write_text('molecule_id,value\nm1,0\n')
            manifest={key:'Synthetic test fixture' for key in [
                'endpoint','endpoint_definition','output_units_or_classes','checkpoint_source',
                'license','preprocessing','feature_settings','bionemo_commit','reviewed_by']}
            manifest.update(endpoint_finetuned=True,checkpoint_path='checkpoint.bin',
                checkpoint_sha256=hashlib.sha256(checkpoint).hexdigest(),
                reference_dataset='inputs.csv',reference_expected_output='expected.csv')
            (p/'manifest.json').write_text(json.dumps(manifest))
            result=admet.validate(p/'manifest.json')
            self.assertEqual(result['reference_molecules'],1)
            self.assertEqual(result['checkpoint_sha256'],manifest['checkpoint_sha256'])
            (p/'checkpoint.bin').write_bytes(checkpoint+b'tampered')
            with self.assertRaisesRegex(ValueError,'Checkpoint hash does not match'):
                admet.validate(p/'manifest.json')
    def test_admet_placeholder_cannot_run(self):
        with self.assertRaisesRegex(ValueError,'Missing verified field'):admet.validate('science/admet/endpoint.example.json')
if __name__=='__main__':unittest.main()
