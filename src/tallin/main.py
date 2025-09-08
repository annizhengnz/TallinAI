#!/usr/bin/env python
import sys
import warnings

from datetime import datetime
import os

from tallin.crew import Tallin

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

def run():
    """
    Run the crew.
    """
    image_path = os.getenv('TALLIN_IMAGE_PATH', '/Users/anni/Projects/Tallin/backend/uploads/test_image.jpeg')
    inputs = {
        'image_path': image_path,
        'current_year': str(datetime.now().year)
    }
    
    try:
        Tallin().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    image_path = os.getenv('TALLIN_IMAGE_PATH', '/Users/anni/Projects/Tallin/backend/uploads/test_image.jpeg')
    inputs = {
        'image_path': image_path,
        'current_year': str(datetime.now().year)
    }
    try:
        Tallin().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        Tallin().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    image_path = os.getenv('TALLIN_IMAGE_PATH', '/Users/anni/Projects/Tallin/backend/uploads/test_image.jpeg')
    inputs = {
        'image_path': image_path,
        'current_year': str(datetime.now().year)
    }
    
    try:
        Tallin().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")
