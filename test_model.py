import tensorflow as tf
import librosa
import numpy as np
import matplotlib.pyplot as plt

chord_name = ['Chord Am', 'Chord A', 'Chord C', 'Chord Bm', 'Chord Bbm', 'Chord B', 'Chord Cm', 'Chord C#m', 'Chord Bb', 'Chord C#', 'Chord Em', 'Chord D', 'Chord F', 'Chord Fm', 'Chord D#', 'Chord E', 'Chord F#m', 'Chord F#', 'Chord D#m', 'Chord Dm', 'Chord G#m', 'Chord G#', 'Chord G', 'Chord Gm']
model = tf.keras.models.load_model('D:\About the study\Project\Guiter Chord Recognition\Backend\GT-APP-API\model\Guitar_Trainer_Model_V0.20.h5')
# def chromagram_extraction(file_path):
#     audio_data, sample_rate = librosa.load(file_path)
#     chromagram = librosa.feature.chroma_stft(y=audio_data, sr=sample_rate)
#     plt.figure(figsize=(12,4))
#     librosa.display.specshow(chromagram, sr=sample_rate, x_axis='time', y_axis='chroma', vmin=0, vmax=1)
#     plt.title('Chromagram')
#     plt.colorbar()
#     plt.tight_layout()
#     return chromagram

# def tonnetz_extraction(file_path):
#     audio_data, sample_rate = librosa.load(file_path)
#     tonnetz = librosa.feature.tonnetz(y=audio_data, sr=sample_rate)
#     plt.figure(figsize=(10, 6))
#     librosa.display.specshow(tonnetz, y_axis='tonnetz')
#     plt.colorbar()
#     plt.title('Tonnetz feature')
#     plt.show()
#     return tonnetz

def feature2model(file_path):
    audio_data, sample_rate = librosa.load(file_path)
    chromagram = librosa.feature.chroma_stft(y=audio_data, sr=sample_rate)
    tonnetz = librosa.feature.tonnetz(y=audio_data, sr=sample_rate)
    feature_combine = np.concatenate((chromagram, tonnetz), axis=0)
    return feature_combine

# Used Path
# path = 'D:\\About the study\\Project\\Guiter Chord Recognition\\Backend\\GT-APP-API\\UserChordSound\\userSound.wav'
# Test Path
path = 'D:\\Music\\Dataset\\Guitar Chord Dataset V2\\Chord Gm\\Gm (G form AC2) Pick.wav'

sound_feature = feature2model(path)
# print(sound_feature.shape)
model_ansPredicted = model.predict(sound_feature[None,:,:,None]).argmax()
print('Model Answer:', chord_name[model_ansPredicted], model_ansPredicted)

