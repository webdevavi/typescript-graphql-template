import formatDate from "date-fns/format"
import { createLogger, format, transports } from "winston"

const { combine, timestamp, label, printf } = format

const customFormat = printf(
    ({ level, message, label, timestamp, durationMs }) => {
        return `${formatDate(
            new Date(timestamp),
            "yyyy-MM-dd pp"
        )} [${label}] ${level}: ${message} ${
            durationMs ? " " + ` ${durationMs / 1000}s ` : ""
        }`
    }
)

const _customFormat = (customLabel: string) =>
    combine(label({ label: customLabel }), timestamp(), customFormat)

export const createCustomLogger = (customLabel: string) => {
    return createLogger({
        level: "info",
        format: _customFormat(customLabel),
        transports: [
            new transports.Console({
                format: _customFormat(customLabel),
            }),
        ],
    })
}
