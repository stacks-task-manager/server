/// <reference path="../pb_data/types.d.ts" />

module.exports = {
    checkForOwner: next => {
        return c => {
            const info = $apis.requestInfo(c);
            const record = info.authRecord;

            if (!record) {
                throw new UnauthorizedError("Unauthorized request");
            }

            return next(c);
        };
    },
};
