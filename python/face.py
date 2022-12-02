import sys
import os

from deepface import DeepFace
backends = [
  'opencv', 
  'ssd', 
  'dlib', 
  'mtcnn', 
  'retinaface', 
  'mediapipe'
]
os.write(3, '{"dt" : "This is a test"}\n', "utf8")
# imgs = []
# for line in sys.stdin:
#   print(line)
#   imgs.append(line)
#   if len(imgs) == 2:
#     break
# print(imgs)
# result = DeepFace.verify(
#   img1_path = imgs[0],
#   img2_path = imgs[0],
#   detector_backend = backends[4])

# print(result["verified"])