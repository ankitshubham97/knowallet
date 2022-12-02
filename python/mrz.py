from passporteye import read_mrz
import datetime
import time
import io
import base64
import sys

from base64 import decodebytes
from PIL import Image

b64_encoded_image = sys.argv[1].split(",")


mrz = read_mrz(io.BytesIO(base64.decodebytes(bytes(b64_encoded_image[len(b64_encoded_image)-1], "utf-8")))).__dict__
passport_dob = mrz["date_of_birth"]
short_year = int(passport_dob[0:2])
month = int(passport_dob[2:4])
day = int(passport_dob[5:6])
year = 2000 + short_year
if short_year > 30:
  year = 1900 + short_year
date_time = datetime.datetime(year, month, day)
age_in_epochs = int((time.mktime(date_time.timetuple())))
print(year)