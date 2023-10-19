import sys
if len(sys.argv) < 2:
    print("Insufficient arguments provided.")
    sys.exit(1)

file = sys.argv[1]
chord = sys.argv[2]
print(f'Python file receive \"{chord}\" and \"{file}\" from you.')
print('Thank you!!!')
