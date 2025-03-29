# -*- coding: utf-8 -*-

from __future__ import absolute_import
from kaos.fuzzy import fuzzy_or
from kaos.LogicAbstract import LogicAbstract


class LogicDisjunction(LogicAbstract):
    """A logical disjunction for a KAOS goal model.

    """
    @staticmethod
    def from_xml(root):
        """Reads KAOS goal model logic and utility functions from an xml element.

        :param root: a root xml element
        :return: a logic expression
        """
        item = LogicDisjunction()
        if (root is not None) and (root.tag.lower() == 'disjunction'):
            item._key = root.attrib['id'] if 'id' in root.attrib else None
            for elem in root:
                if elem.tag.lower() == 'biconditional':
                    from kaos.LogicBiconditional import LogicBiconditional
                    item._children.append(LogicBiconditional.from_xml(elem))
                elif elem.tag.lower() == 'conditional':
                    from kaos.LogicConditional import LogicConditional
                    item._children.append(LogicConditional.from_xml(elem))
                elif elem.tag.lower() == 'conjunction':
                    from kaos.LogicConjunction import LogicConjunction
                    item._children.append(LogicConjunction.from_xml(elem))
                elif elem.tag.lower() == 'disjunction':
                    item._children.append(LogicDisjunction.from_xml(elem))
                elif elem.tag.lower() == 'function':
                    from kaos.UtilityFunction import UtilityFunction
                    item._children.append(UtilityFunction.from_xml(elem))
        return item

    def __init__(self):
        """Initializes the object.

        """
        super(LogicDisjunction, self).__init__()
        self._children = list()

    def __str__(self):
        """Converts the logic expression into a string format.

        :return: a string representation of the logic expression
        """
        return self.to_string()

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
        return util_funcs

    def evaluate(self, values, allow_shortcircuit=False, step=None, threshold=0.5):
        """Evaluates as a logical disjunction.
        Note: uses fuzzy logic (or: max(x, y)).

        :param values: a dict of operands with associated values
        :param allow_shortcircuit: allows short-circuit evaluation
        :param step: the current step of evaluation
        :param threshold: high value threshold
        :return: an evaluation of the given values
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, step=step, threshold=threshold)
        result = 0.0 if len(self._children) > 0 else 1.0
        for child in self._children:
            result = fuzzy_or(result, child.evaluate(values, **kwargs))
            if allow_shortcircuit and result >= threshold:
                break
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
        for child in self._children:
            violated = violated | child.get_violated(start=start, end=end, **kwargs)
        return violated

    def is_satisfied(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """Evaluates satisfaction of logical disjunction, based on history.
        Note: uses fuzzy logic (or: max(x, y)).

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, threshold=threshold)
        result = 0.0 if len(self._children) > 0 else 1.0
        for child in self._children:
            result = fuzzy_or(result, child.is_satisfied(start=start, end=end, **kwargs))
            if allow_shortcircuit and result >= threshold:
                break
        return result

    def to_string(self, expanded=False):
        """Converts the logical disjunction into a string format.

        :param expanded: expands the string if true
        :return: a string representation of the logical disjunction
        """
        if expanded:
            return '({0})'.format(' OR '.join([child.to_string(expanded=expanded) for child in self._children]))
        else:
            return '(OR {0})'.format(' '.join([child.to_string(expanded=expanded) for child in self._children]))
