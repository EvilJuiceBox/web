# -*- coding: utf-8 -*-


class LogicAbstract(object):
    """An abstract logical operation.

    """
    @staticmethod
    def from_xml(root):
        """Reads KAOS goal model logic and utility functions from an xml element.

        :param root: a root xml element
        :return: a logic expression
        """
        raise NotImplementedError()

    def __init__(self):
        """Initializes the object.

        """
        self._key = None
        self._history = dict()

    def __str__(self):
        """Converts the logic expression into a string format.

        :return: a string representation of the logic expression
        """
        return self.to_string()

    @property
    def key(self):
        """An identifier for the logic expression.

        :return: an id
        """
        return self._key

    @property
    def history(self):
        """A history of the evaluations for the logic expression.

        :return: a list of past evaluation results
        """
        return self._history

    @property
    def utility_functions(self):
        """A dict of associated utility functions.

        :return: a dict of associated utility functions.
        """
        return dict()

    def evaluate(self, values, allow_shortcircuit=False, step=None, threshold=0.5):
        """Evaluates logical expression.

        :param values: a dict of operands with associated values
        :param allow_shortcircuit: allows short-circuit evaluation
        :param step: the current step of evaluation
        :param threshold: high value threshold
        :return: an evaluation of the given values
        """
        raise NotImplementedError()

    def get_violated(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        raise NotImplementedError()

    def is_satisfied(self, start=None, end=None, allow_shortcircuit=False, threshold=0.5):
        """Evaluates satisfaction of a logical expression, based on history.

        :param start: starting index of history
        :param end: end index of history
        :param allow_shortcircuit: allows short-circuit evaluation
        :param threshold: high value threshold
        :return: satisfaction (or satisficement)
        """
        raise NotImplementedError()

    def to_string(self, expanded=False):
        """Converts the logical expression into a string format.

        :param expanded: expands the string if true
        :return: a string representation of the logical expression
        """
        return '{0}'.format(self._key) if self._key is not None else ''
