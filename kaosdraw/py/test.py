# -*- coding: utf-8 -*-

from __future__ import print_function
from kaos import KAOSEvaluator
import argparse
import os


def main(args):
    """

    :param args:
    :return:
    """
    # read kaos model file
    file_path = os.path.join('..', 'examples', 'kaos_example.xml')
    print('Reading "{0}"... '.format(file_path), end='')
    try:
        evaluator = KAOSEvaluator.read_xml_file(file_path)
    except:
        print('failed')
        return
    print('done')

    # display logic expression
    print('')
    print('Logic expression:')
    print('{0}'.format(evaluator))

    # get utility parameters
    print('')
    print('Utility parameters:')
    for param in evaluator.utility_parameters:
        print('  {0}'.format(param))

    # create example system state
    system_state = {
        'mode': 'normal',
        'status': 'solving',
        'conflicts': list(),
        'power_level': 0.28,
        'speed': 1.0,
        'num_actions': 35,
        'path_length': 25,
    }
    print('')
    print('Example system state:')
    for key in sorted(system_state):
        print('  {0}: {1}'.format(key, system_state[key]))

    # evaluate kaos model with system state
    print('')
    print('Evaluating kaos model...')
    result = evaluator.evaluate(system_state)
    print('Result: {0}'.format(result))

    # get violated elements
    violations = evaluator.get_violated()
    print('')
    print('Violations')
    print('{0}'.format(', '.join([violation for violation in violations])))

    # get utility evaluation history
    print('')
    print('Utility history:')
    for key in sorted(evaluator.utility_history):
        print('  {0} {1}'.format(key, evaluator.utility_history[key]))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    main(parser.parse_args())
