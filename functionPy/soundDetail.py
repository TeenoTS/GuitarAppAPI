try:
    import os
    import magic
    import sys

    if len(sys.argv) < 1:
        print("Insufficient arguments provided.")
        sys.exit(1)

    testerFile = sys.argv[1]

    dirname = os.path.dirname(os.path.abspath(__file__))
    # target_path = dirname + "/../fileTemp/" + testerFile
    target_path = "D:/ของเนตร/soundFromApp2"

    mime = magic.Magic(mime=True)

    file_type = mime.from_file(target_path)
    print("File Type:", file_type)

except Exception as error:
    print(f"An error occurred in the soundDetail.py file: {error}")