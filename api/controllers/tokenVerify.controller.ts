export const tokenVerifyController = async (req, res) => {
    try {
        res.status(200).json("token: ok")
    } catch (error) {
        res.status(400).json(error)
    }
}
