const asyncHandler = (requestHandler) => {
   (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
   }
}
// 6:03:12



export { asyncHandler }






// const asyncHandler = () => { }
//  const asyncHandler = () =>{()=>{}}
// const asyncHandler = (fn) => () => { }

/**using tyr catch */
// const asyncHandler = (fn) => async (req, res, next) => {
//    try {
//       await fn(req, res, next)
//    } catch (error) {
//       res.status(err.code || 500).json({
//          sucess: false,
//          message: err.message
//       })
//    }
// }