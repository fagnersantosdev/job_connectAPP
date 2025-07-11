const ValidMiddleware = {
  validId: (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: "O ID do usuário deve ser um número",
      });
    }

    next();
  },
};

export default ValidMiddleware;
