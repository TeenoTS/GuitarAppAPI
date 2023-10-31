
try: 
    import os
    import tensorflow as tf
    import librosa
    import numpy as np

    dirname = os.path.dirname(os.path.abspath(__file__))

    chord_name = ['A(MINOR)', 'A(MAJOR)', 'C(MAJOR)', 'B(MINOR)', 'Bb(MINOR)', 'B(MAJOR)', 'C(MINOR)', 'C#(MINOR)', 'Bb(MAJOR)', 'C#(MAJOR)', 'E(MINOR)', 'D(MAJOR)', 'F(MAJOR)', 'F(MINOR)', 'D#(MAJOR)', 'E(MAJOR)', 'F#(MINOR)', 'F#(MAJOR)', 'D#(MINOR)', 'D(MINOR)', 'G#(MINOR)', 'G#(MAJOR)', 'G(MAJOR)', 'G(MINOR)']
    # model = tf.keras.models.load_model(dirname + '\Guitar_Trainer_Model_V0.20.h5')
    model = tf.keras.models.load_model(dirname + '/Guitar_Trainer_Model_V0.20.h5')

    def feature2model(file_path):
        audio_data, sample_rate = librosa.load(file_path)
        chromagram = librosa.feature.chroma_stft(y=audio_data, sr=sample_rate)
        tonnetz = librosa.feature.tonnetz(y=audio_data, sr=sample_rate)
        feature_combine = np.concatenate((chromagram, tonnetz), axis=0)
        return feature_combine

    # Used Path
    # path = 'D:\\About the study\\Project\\Guiter Chord Recognition\\Backend\\GT-APP-API\\UserChordSound\\userSound.wav'
    # path = dirname + r'\..\UserChordSound\userSound.wav'
    path = dirname + r'/../UserChordSound/userSound.wav'
    # Test Path
    # path = 'D:\\Music\\Dataset\\Guitar Chord Dataset V2\\Chord Gm\\Gm (G form AC2) Pick.wav'

    if os.path.exists(path):
        sound_feature = feature2model(path)
        model_ansPredicted = model.predict(sound_feature[None,:,:,None]).argmax()
        # print('Model Answer:', chord_name[model_ansPredicted], '['+str(model_ansPredicted)+']')
        print(chord_name[model_ansPredicted])

    else:
        print('File not found at:', path)

except Exception as error:
    print(f"An error occurred in the Predict.py file: {error}")

