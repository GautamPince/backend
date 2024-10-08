import multer from "multer";

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "./public/temp")
   },
   filename: function (req, file, cb) {
      // 1 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      // 1 cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, file.originalname)
   }
})
// 7:41:21
// 7:43:40

// 1 export const upload = multer({ storage: storage })
export const upload = multer(
   {
      storage,
   }
)