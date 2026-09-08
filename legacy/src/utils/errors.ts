import i18n from "@/i18n";

export class Failure extends Error {
  public data: any;
  public status?: number;
  constructor(
    public message: string,
    data?: any,
    status?: number,
  ) {
    super(message);
    this.data = data;
    this.status = status;
  }
}

/**
 * Cette fonction retourne une chaine de caractère d'erreur
 * @param {string} error
 * @returns une chaine de caractère d'erreur
 */
export function formatHttpErrors(error: any): string {
  let message: string = "";

  // Cas d'erreur vide
  if (!error || !error.hasOwnProperty("message") || error.message == "") {
    return (message = i18n.global.t("validation.generic-error"));
  }

  // Cas du message
  if (error.hasOwnProperty("message") && error.message !== "") {
    return (message = error.message as string);
  }

  // Cas du Duplicate
  if (error.hasOwnProperty("Duplicate") && error.Duplicate.length !== 0) {
    for (let item of error.Duplicate) {
      message += item?.message ?? "";
      message += "\n";
    }
    return message;
  }

  // Cas du MissingField
  if (error.hasOwnProperty("MissingField") && error.MissingField.length !== 0) {
    for (let item of error.MissingField) {
      message += item?.message ?? "";
      message += "\n";
    }
    return message;
  }

  return error;
}
