# -*- coding: utf-8 -*-


from __future__ import division
def fuzzy_and(*values):
    """

    :param values:
    :return:
    """
    return min(values)


def fuzzy_not(value):
    """

    :param value:
    :return:
    """
    result = 1.0 - value
    return result


def fuzzy_or(*values):
    """

    :param values:
    :return:
    """
    return max(values)


def left_shoulder(value, target, deviation=0.1):
    """

    :param value:
    :param target:
    :param deviation:
    :return:
    """
    try:
        value = float(value)
    except ValueError:
        raise ValueError('Invalid numeric value: "{0}"'.format(value))

    try:
        target = float(target)
    except ValueError:
        raise ValueError('Invalid numeric target: "{0}"'.format(target))

    try:
        deviation = float(deviation)
    except ValueError:
        raise ValueError('Invalid numeric deviation: "{0}"'.format(deviation))

    if value >= target:
        return 1.0
    elif value <= target - deviation:
        return 0.0
    else:
        return (target - deviation - value) / deviation

def right_shoulder(value, target, deviation=0.1):
    """

    :param value:
    :param target:
    :param deviation:
    :return:
    """
    try:
        value = float(value)
    except ValueError:
        raise ValueError('Invalid numeric value "{0}".'.format(value))

    try:
        target = float(target)
    except ValueError:
        raise ValueError('Invalid numeric target: "{0}".'.format(target))

    try:
        deviation = float(deviation)
    except ValueError:
        raise ValueError('Invalid numeric deviation: "{0}".'.format(deviation))

    if value <= target:
        return 1.0
    elif value >= target + deviation:
        return 0.0
    else:
        return (target + deviation - value) / deviation


def triangle(value, target, deviation=0.1):
    """

    :param value:
    :param target:
    :param deviation:
    :return:
    """
    try:
        value = float(value)
    except ValueError:
        raise ValueError('Invalid numeric value "{0}".'.format(value))

    try:
        target = float(target)
    except ValueError:
        raise ValueError('Invalid numeric target "{0}".'.format(target))

    try:
        deviation = float(deviation)
    except ValueError:
        raise ValueError('Invalid numeric deviation "{0}".'.format(deviation))

    if value < target:
        return left_shoulder(value, target, deviation=deviation)
    elif value > target:
        return right_shoulder(value, target, deviation=deviation)
    else:
        return 1.0
