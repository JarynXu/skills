"""验证可发现元数据和任务材料隔离，不将其等同于模型主动调用成功。"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

import yaml

SKILL = Path(__file__).resolve().parents[1]


class DiscoveryContract(unittest.TestCase):
    def test_implicit_invocation_is_not_disabled(self):
        """检测真实宿主字段及名称关系，避免用正文关键词当行为断言。"""
        text = (SKILL / 'SKILL.md').read_text(encoding='utf-8')
        meta = yaml.safe_load(re.match(r'\A---\n(.*?)\n---', text, re.S)[1])
        host = yaml.safe_load((SKILL / 'agents/openai.yaml').read_text(encoding='utf-8'))
        self.assertEqual(set(meta), {'name', 'description'})
        self.assertEqual(meta['name'], 'knowledge')
        self.assertIs(host['policy']['allow_implicit_invocation'], True)
        self.assertIn('$' + meta['name'], host['interface']['default_prompt'])
        self.assertLessEqual(len(meta['description']), 1024)

    def test_trigger_cases_materialize_without_reviewer_labels(self):
        """通过实际准备命令生成隐式场景，不把预期触发结果交给执行者。"""
        cases = json.loads((SKILL / 'evals/cases.json').read_text(encoding='utf-8'))['cases']
        selected = [case for case in cases if case['id'].startswith('implicit-')]
        self.assertTrue(any(case['expect_invocation'] for case in selected))
        self.assertTrue(any(not case['expect_invocation'] for case in selected))
        with tempfile.TemporaryDirectory(prefix='knowledge-discovery-') as directory:
            for case in selected:
                with self.subTest(case=case['id']):
                    root = Path(directory) / case['id']
                    result = subprocess.run(
                        [sys.executable, str(SKILL / 'evals/prepare_case.py'), case['id'], '--output', str(root)],
                        capture_output=True, text=True, timeout=10,
                        env=dict(os.environ, PYTHONDONTWRITEBYTECODE='1'),
                    )
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertEqual((root / 'TASK.txt').read_text(encoding='utf-8'), case['task'] + '\n')
                    names = {p.name for p in root.rglob('*') if p.is_file()}
                    self.assertFalse(names.intersection({'cases.json', 'SKILL.md', 'test_discovery_contract.py'}))
                    for p in root.rglob('*'):
                        if p.is_file():
                            self.assertNotIn('expect_invocation', p.read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
