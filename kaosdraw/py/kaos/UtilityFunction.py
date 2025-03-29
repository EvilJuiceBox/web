# -*- coding: utf-8 -*-

from __future__ import absolute_import
from kaos.fuzzy import left_shoulder
from kaos.fuzzy import right_shoulder
from kaos.fuzzy import triangle
from kaos.LogicAbstract import LogicAbstract
import numpy as np


class UtilityFunction(LogicAbstract):
    """A utility function for a KAOS goal model.

    """
    @staticmethod
    def from_xml(root):
        """Reads KAOS goal model logic and utility functions from an xml element.

        :param root: a root xml element
        :return: a utility function
        """
        item = UtilityFunction()
        if (root is not None) and (root.tag.lower() == 'function'):
            item._key = root.attrib['id'] if 'id' in root.attrib else None
            item._type = root.attrib['type'] if 'type' in root.attrib else None
            item._objective = root.attrib['objective'] if 'objective' in root.attrib else None
            params = dict()
            for elem in root:
                if elem.tag.lower() == 'parameter':
                    index = elem.attrib['index'] if 'index' in elem.attrib else None
                    value = elem.attrib['value'] if 'value' in elem.attrib else None
                    try:
                        # convert index to integer
                        index = int(index)
                    except TypeError:
                        # skip to next parameter if not integer
                        continue
                    except ValueError:
                        # skip to next parameter if not integer
                        continue

                    try:
                        # convert value to float
                        value = float(value)
                    except TypeError:
                        # do not convert value if not float
                        pass
                    except ValueError:
                        # check if boolean, otherwise, do no conversion
                        if value.lower() == 'true':
                            value = True
                        elif value.lower() == 'false':
                            value = False
                        pass
                    params[index] = value
            item._operands = [params[k] for k in sorted(params.keys())]
        return item

    def __init__(self):
        """Initializes the object.

        """
        super(UtilityFunction, self).__init__()
        self._type = None
        self._objective = None
        self._operations = {
            'equal':            (lambda x, y: x == y),
            'greater':          (lambda x, y: x > y),
            'greater_or_equal': (lambda x, y: x >= y),
            'less':             (lambda x, y: x < y),
            'less_or_equal':    (lambda x, y: x <= y),
            'not_equal':        (lambda x, y: x != y),
            'existence':        (lambda x: True if x else False),
            'nonexistence':     (lambda x: False if x else True),
            'membership':       (lambda x, y: x in y),
            'nonmembership':    (lambda x, y: x not in y),
            'fuzzy_left':       (lambda x, y, d: left_shoulder(x, y, deviation=d)),
            'fuzzy_right':      (lambda x, y, d: right_shoulder(x, y, deviation=d)),
            'fuzzy_triangle':   (lambda x, y, d: triangle(x, y, deviation=d)),
        }
        self._operands = list()

    def __str__(self):
        """Converts the utility function into a string format.

        :return: a string representation of the utility function
        """
        return self.to_string()

    @property
    def objective(self):
        """Objective for satisfying the utility function.

        :return: objective
        """
        return self._objective

    @property
    def operands(self):
        """Operands for the utility function.

        :return: a list of operands
        """
        return self._operands

    @property
    def utility_functions(self):
        """A dict of associated utility functions.

        :return: a dict of associated utility functions.
        """
        return {self._key: self} if self._key is not None else dict()

    @property
    def type(self):
        """Type of operation for the utility function.

        :return: operation type
        """
        return self._type

    def evaluate(self, values, allow_shortcircuit=False, step=None, threshold=0.5):
        """Evaluates utility function.

        :param values: a dict of operands with associated values
        :param allow_shortcircuit: allows short-circuit evaluation
        :param step: the current step of evaluation
        :param threshold: high value threshold
        :return: an evaluation of the given values
        """
        # check if values is a dict
        if not isinstance(values, dict):
            raise ValueError('Values must be supplied as a dictionary.')

        # check if operation exists for current type
        if self._type not in self._operations:
            raise ValueError('Invalid operation type "{self._type}".')

        # get operation and check if the number of operands is valid
        operation = self._operations[self._type]
        if len(self._operands) != operation.func_code.co_argcount:
            raise ValueError('Invalid number of arguments for operation.')

        # sub values for each operand
        args = [values[x] if x in values else x for x in self._operands]

        # strip quotes from string values
        args = [x[1:-1] if isinstance(x, basestring) and x.startswith('"') and x.endswith('"') else x for x in args]
        args = [x[1:-1] if isinstance(x, basestring) and x.startswith("'") and x.endswith("'") else x for x in args]

        # evaluate the operation and return the result
        result = float(operation(*args))

        # update history
        if step is not None:
            self._history[step] = result

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
        violated = set([self._key]) if self._key is not None and not self.is_satisfied(start=start, end=end, **kwargs) else set()
        return violated

    def is_satisfied(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """Evaluates satisfaction of utility function, based on history.

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        # if nothing has been evaluated, return True by default
        if len(self._history) == 0:
            return 0.0

        # convert history to an array
        steps = sorted(self._history.keys())
        start = steps[0] if start is None else start
        end = steps[-1] + 1 if end is None else end
        history = np.array([self._history[step] for step in steps if start <= step < end], dtype=np.float32)

        # determine satisfaction based on history and objective
        if self._objective is not None and self._objective.lower() == 'achieve':
            # satisfied if ever exceeds threshold
            return float(np.any(history >= threshold))
        elif self._objective is not None and self._objective.lower() == 'avoid':
            # satisfied if never exceeds threshold
            return not float(np.any(history >= threshold))
        elif self._objective is not None and self._objective.lower() == 'maintain':
            # satisfied if always exceeds threshold
            return float(np.all(history >= threshold))
        else:
            # by default only consider most recent entry in history
            return float((history[-1] >= threshold))

    def to_string(self, expanded=False):
        """Converts the utility function into a string format.

        :param expanded: expands the string if true
        :return: a string representation of the utility function
        """
        if expanded:
            return '{0}({1})'.format(self._type, ', '.join([str(x) for x in self._operands]))
        else:
            return '{0}'.format(self._key)
