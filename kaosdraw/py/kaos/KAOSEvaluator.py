# -*- coding: utf-8 -*-

from __future__ import division
from __future__ import absolute_import
from itertools import izip
from kaos.LogicBiconditional import LogicBiconditional
from kaos.LogicConditional import LogicConditional
from kaos.LogicConjunction import LogicConjunction
from kaos.LogicDisjunction import LogicDisjunction
from kaos.UtilityFunction import UtilityFunction
import numpy as np
import xml.etree.ElementTree as ET


class KAOSEvaluator(object):
    """Evaluates a KAOS goal model based on utility functions.

    """
    @staticmethod
    def read_xml_file(file_path, allow_shortcircuit=False):
        """Reads KAOS goal model logic and utility functions from an xml file.

        :param file_path: path to an xml file
        :param allow_shortcircuit: allows short-circuit evaluation
        :return: an evaluator to evaluate the KAOS goal model.
        """
        evaluator = KAOSEvaluator(allow_shortcircuit=allow_shortcircuit)
        tree = ET.parse(file_path)
        root = tree.getroot()
        if root.tag.lower() == 'logic':
            evaluator._id = root.attrib['id'] if 'id' in root.attrib else None
            for elem in root:
                if elem.tag.lower() == 'biconditional':
                    evaluator._children.append(LogicBiconditional.from_xml(elem))
                elif elem.tag.lower() == 'conditional':
                    evaluator._children.append(LogicConditional.from_xml(elem))
                elif elem.tag.lower() == 'conjunction':
                    evaluator._children.append(LogicConjunction.from_xml(elem))
                elif elem.tag.lower() == 'disjunction':
                    evaluator._children.append(LogicDisjunction.from_xml(elem))
                elif elem.tag.lower() == 'function':
                    evaluator._children.append(UtilityFunction.from_xml(elem))
        return evaluator

    def __init__(self, allow_shortcircuit=False):
        """Initializes the object.

        """
        self._allow_shortcircuit = allow_shortcircuit
        self._id = None
        self._children = list()
        self._step = 0

    def __str__(self):
        """Converts the evaluated logic expressions into a string format.

        :return: a string representation of the evaluated logic
        """
        return self.to_string()

    @property
    def utility(self):
        """A dict of the most recent utility results for associated utility functions.

        :return: a dict of the most recent utility results for associated utility functions.
        """
        return dict((k, list(v.history.values())[-1]) for k, v in self.utility_functions.items())

    @property
    def utility_parameters(self):
        """A list of utility parameters referenced by the goal model.

        :return: a list of utility parameters
        """
        has_quotes = lambda x: (x.startswith('"') and x.endswith('"')) or (x.startswith("'") and x.endswith("'"))
        util_funcs = self.utility_functions
        util_params = set()
        for k, util_func in util_funcs.items():
            for operand in util_func.operands:
                if isinstance(operand, basestring) and not has_quotes(operand):
                    util_params.add(operand)
        util_params = sorted(list(util_params))
        return util_params

    @property
    def utility_functions(self):
        """A dict of associated utility functions.

        :return: a dict of associated utility functions.
        """
        util_funcs = dict()
        for child in self._children:
            for k, v in child.utility_functions.items():
                if k not in util_funcs:
                    util_funcs[k] = v
        util_funcs = dict((k, util_funcs[k]) for k in sorted(util_funcs.keys()))
        return util_funcs

    @property
    def utility_history(self):
        """A dict of histories for associated utility functions.

        :return: a dict of histories for associated utility functions.
        """
        return dict((k, v.history) for k, v in self.utility_functions.items())

    @property
    def utility_specification(self):
        """A specification of associated utility functions and value ranges.

        :return: a specification of associated utility functions and value ranges.
        """
        return dict((k, [0.0, 1.0]) for k, v in self.utility_functions.items())

    def evaluate(self, values, threshold=0.5):
        """Evaluates logic expression.

        :param values: a dict of operands with associated values
        :param threshold: high value threshold
        :return: an evaluation of the given values
        """
        if any([k not in values for k in self.utility_parameters]):
            raise ValueError('Missing utility parameters: {0}.'.format(" ".join([k for k in self.utility_parameters if k not in values])))
        kwargs = dict(allow_shortcircuit=self._allow_shortcircuit, step=self._step, threshold=threshold)
        result = [child.evaluate(values, **kwargs) for child in self._children]
        self._step += 1
        if len(result) > 1:
            return result
        elif len(result) == 1:
            return result[0]
        else:
            return None

    def get_obstacles(self, key):
        """

        :param key:
        :return:
        """
        # define recursive function to get all logic conditionals associated with the given expression
        def _recursive_fetch(parent, key):
            matches = list()
            if hasattr(parent, '_children'):
                for child in parent._children:
                    if parent.key == key and isinstance(child, LogicConditional):
                        matches += [child]
                    else:
                        matches += _recursive_fetch(child, key)
            return matches

        # search each logic expression for associated conditionals
        result = list()
        for child in self._children:
            result += _recursive_fetch(child, key)
        return result

    def get_violated(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, threshold=threshold)
        violated = set()
        for child in self._children:
            violated |= child.get_violated(start=start, end=end, **kwargs)
        return violated

    def is_satisfied(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """Evaluates satisfaction of a logic expression, based on history.

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, threshold=threshold)
        result = [child.is_satisfied(start=start, end=end, **kwargs) for child in self._children]
        if len(result) > 1:
            return result
        elif len(result) == 1:
            return result[0]
        else:
            return None

    def to_string(self, expanded=False):
        """Converts the evaluated logic expressions into a string format.

        :param expanded: expands the string if true

        :return: a string representation of the evaluated logic
        """
        return '{0}'.format(' '.join(['{0}'.format(child.to_string(expanded=expanded)) for child in self._children]))
