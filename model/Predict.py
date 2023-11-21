
try: 
    import os
    import sys
    import tensorflow as tf
    import librosa
    import numpy as np
    # from pathlib import Path
    from moviepy.editor import *

    sys.stdout = open(os.devnull, 'w')
    sys.stderr = open(os.devnull, 'w')

    dirname = os.path.dirname(os.path.abspath(__file__))

    # chord_name = ['A(MINOR)', 'A(MAJOR)', 'C(MAJOR)', 'B(MINOR)', 'Bb(MINOR)', 'B(MAJOR)', 'C(MINOR)', 'C#(MINOR)', 'Bb(MAJOR)', 'C#(MAJOR)', 'E(MINOR)', 'D(MAJOR)', 'F(MAJOR)', 'F(MINOR)', 'D#(MAJOR)', 'E(MAJOR)', 'F#(MINOR)', 'F#(MAJOR)', 'D#(MINOR)', 'D(MINOR)', 'G#(MINOR)', 'G#(MAJOR)', 'G(MAJOR)', 'G(MINOR)']
    chord_name = [
    'C(MAJOR)', 'C(MINOR)',
    'C#(MAJOR)', 'C#(MINOR)',
    'D(MAJOR)', 'D(MINOR)',
    'D#(MAJOR)', 'D#(MINOR)',
    'E(MAJOR)', 'E(MINOR)',
    'F(MAJOR)', 'F(MINOR)',
    'F#(MAJOR)', 'F#(MINOR)',
    'G(MAJOR)', 'G(MINOR)',
    'G#(MAJOR)', 'G#(MINOR)',
    'A(MAJOR)', 'A(MINOR)',
    'Bb(MAJOR)', 'Bb(MINOR)',
    'B(MAJOR)', 'B(MINOR)',
    ]
    
    # model = tf.keras.models.load_model(dirname + '\Guitar_Trainer_Model_V0.30(4 Featured).h5')
    model = tf.keras.models.load_model(dirname + '/Guitar_Trainer_Model_V0.30(4 Featured).h5')
    
    def time_series_resize(data, target_length = 173):
        data_size = data.shape[1]
        if data_size < target_length:
            while data.shape[1] < target_length:
                last_col = data[:, -1]
                data = np.concatenate((data, last_col.reshape(-1, 1)), axis=1)
        elif data_size > target_length:
            while data.shape[1] > target_length:
                data = np.delete(data, -1, axis=1)
        return data

    def feature2model(file_path):
        audio_data, sample_rate = librosa.load(file_path)

        chromagram = librosa.feature.chroma_stft(y=audio_data, sr=sample_rate)
        melspectrogram = librosa.feature.melspectrogram(y=audio_data, sr=sample_rate)
        spectral_contrast = librosa.feature.spectral_contrast(y=audio_data, sr=sample_rate)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)

        chromagram = time_series_resize(chromagram)
        melspectrogram = time_series_resize(melspectrogram)
        spectral_contrast = time_series_resize(spectral_contrast)
        spectral_centroid = time_series_resize(spectral_centroid)
        # print("After resize:", chromagram_resize, chromagram_resize)
        feature_combine = np.concatenate((chromagram, melspectrogram, spectral_contrast, spectral_centroid), axis=0)
        return feature_combine

    # Used Path
    # path = 'D:\\About the study\\Project\\Guiter Chord Recognition\\Backend\\GT-APP-API\\UserChordSound\\userSound.wav'
    # path = dirname + r'\..\UserChordSound\userSound.wav'
    file_path = dirname + r'/../UserChordSound/userSound.wav'
    converted_file_path = dirname + r'/../UserChordSound/userSound_converted.wav'
    # Test Path
    # path = 'D:\\Music\\Dataset\\Guitar Chord Dataset V2\\Chord Gm\\Gm (G form AC2) Pick.wav'
    if os.path.exists(file_path):
        # completed_process = subprocess.run(['ffmpeg', '-i', normalized_file_path, '-acodec', 'pcm_s16le', '-ac', '1', normalized_converted_file_path], check=True, stderr=subprocess.PIPE)
        audio = AudioFileClip(file_path)
        audio.write_audiofile(converted_file_path, codec='pcm_s16le')
        if os.path.exists(converted_file_path):
            sound_feature = feature2model(converted_file_path)
            model_ansPredicted = model.predict(sound_feature[None,:,:,None]).argmax()
            # print('Model Answer:', chord_name[model_ansPredicted], '['+str(model_ansPredicted)+']')
            print(chord_name[model_ansPredicted])
        else:
            print("Conversion failed. The converted file does not exist.")

    else:
        print('File not found at:', file_path)

except Exception as error:
    print(f"An error occurred in the Predict.py file: {error}")

