import multer from "multer";

const storage = multer.diskStorage({
  destination : function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename : function (req, file, cb){
    // can cause conflicts as there may be mul. file names user saved
    cb(null, file.originalname)
  }
})

export const upload = multer({
  storage,
})