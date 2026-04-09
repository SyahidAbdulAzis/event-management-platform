import { Request, Response, NextFunction } from "express"

interface AuthenticatedRequest extends Request {
  user?: {
    role: string
  }
}

const roleMiddleware = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== role) {
        return res.status(403).json({
          message: "Forbidden access"
        })
      }

      next()
    } catch (err: any) {
      return res.status(500).json({
        message: err.message
      })
    }
  }
}

export default roleMiddleware
