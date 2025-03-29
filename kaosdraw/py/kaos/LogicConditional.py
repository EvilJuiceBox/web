# -*- coding: utf-8 -*-

from __future__ import absolute_import
from kaos.LogicAbstract import LogicAbstract


class LogicConditional(LogicAbstract):
    """A logical conditional for a KAOS goal model.

    """
    @staticmethod
    def from_xml(root):
        """Reads KAOS goal model logic and utility functions from an xml element.

        :param root: a root xml element
        :return: a logic expression
        """
        item = LogicConditional()
        if (root is not None) and (root.tag.lower() == 'conditional'):
            item._key = root.attrib['id'] if 'id' in root.attrib else None
            for elem in root:
                if elem.tag.lower() == 'biconditional':
                    from kaos.LogicBiconditional import LogicBiconditional
                    item._children.append(LogicBiconditional.from_xml(elem))
                elif elem.tag.lower() == 'conditional':
                    item._children.append(LogicConditional.from_xml(elem))
                elif elem.tag.lower() == 'conjunction':
                    from kaos.LogicConjunction import LogicConjunction
                    item._children.append(LogicConjunction.from_xml(elem))
                elif elem.tag.lower() == 'disjunction':
                    from kaos.LogicDisjunction import LogicDisjunction
                    item._children.append(LogicDisjunction.from_xml(elem))
                elif elem.tag.lower() == 'function':
                    from kaos.UtilityFunction import UtilityFunction
                    item._children.append(UtilityFunction.from_xml(elem))
        return item

    def __init__(self):
        """Initializes the object.

        """
        super(LogicConditional, self).__init__()
        self._children = list()

    def __str__(self):
        """Converts the logic expression into a string format.

        :return: a string representation of the logic expression
        """
        return self.to_string()

    @property
    def post_condition(self):
        """

        :return:
        """
        return self._children[1] if len(self._children) > 1 else None

    @property
    def pre_condition(self):
        """

        :return:
        """
        return self._children[0] if len(self._children) > 0 else None

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
        """Evaluates as a logical conditional.
        Note: uses fuzzy logic (triggers if clause exceeds threshold).

        :param values: a dict of operands with associated values
        :param allow_shortcircuit: allows short-circuit evaluation
        :param step: the current step of evaluation
        :param threshold: high value threshold
        :return: an evaluation of the given values
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, step=step, threshold=threshold)
        if len(self._children) == 0:
            raise ValueError('No elements for conditional.')
        if len(self._children) > 2:
            raise ValueError('Too many elements for conditional.')
        left = self._children[0].evaluate(values, **kwargs)
        right = self._children[1].evaluate(values, **kwargs) if not allow_shortcircuit else None
        if left >= threshold:
            result = right if right is not None else self._children[1].evaluate(values, **kwargs)
        else:
            result = 1.0 - left
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
        if len(self._children) == 0:
            raise ValueError('No elements for conditional.')
        if len(self._children) > 2:
            raise ValueError('Too many elements for conditional.')

        # evaluate left
        violated = set()
        if self._children[0].is_satisfied(start=start, end=end, **kwargs):
            violated |= self._children[1].get_violated(start=start, end=end, **kwargs)
        else:
            violated |= self._children[0].get_violated(start=start, end=end, **kwargs)
            violated |= self._children[1].get_violated(start=start, end=end, **kwargs)

        return violated

    def is_satisfied(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """Evaluates satisfaction of logical conditional, based on history.
        Note: uses fuzzy logic (triggers if clause exceeds threshold).

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        kwargs = dict(allow_shortcircuit=allow_shortcircuit, threshold=threshold)
        if len(self._children) == 0:
            raise ValueError('No elements for conditional.')
        if len(self._children) > 2:
            raise ValueError('Too many elements for conditional.')

        # evaluate left
        left = self._children[0].is_satisfied(start=start, end=end, **kwargs)
        result = left
        if len(self._children) == 1:
            return result

        # evaluate right
        right = self._children[1].is_satisfied(start=start, end=end, **kwargs) if not allow_shortcircuit else None
        if left >= threshold:
            result = right if right is not None else self._children[1].is_satisfied(start=start, end=end, **kwargs)
        else:
            result = 1.0 - left
        return result

    def to_string(self, expanded=False):
        """Converts the logical conditional into a string format.

        :param expanded: expands the string if true
        :return: a string representation of the logical conditional
        """
        if expanded:
            left = ' '.join([child.to_string(expanded=expanded) for child in self._children[0:1]])
            right = ' '.join([child.to_string(expanded=expanded) for child in self._children[1:]])
            return '(IF {0} THEN {1})'.format(left, right)
        else:
            return '(IF {0})'.format(' '.join([child.to_string(expanded=expanded) for child in self._children]))
