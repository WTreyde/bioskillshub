import datetime,importlib.util,unittest
spec=importlib.util.spec_from_file_location('stop','scripts/stop-workspace.py');stop=importlib.util.module_from_spec(spec);spec.loader.exec_module(stop)
class OperationsTests(unittest.TestCase):
    def test_shutdown_never_runs_before_authorized_time(self):
        self.assertFalse(stop.due(datetime.datetime(2026,9,21,10,59,59,tzinfo=datetime.timezone.utc)))
        self.assertTrue(stop.due(datetime.datetime(2026,9,21,11,0,tzinfo=datetime.timezone.utc)))
        with self.assertRaises(ValueError):stop.due(datetime.datetime(2026,9,21,12,0))
