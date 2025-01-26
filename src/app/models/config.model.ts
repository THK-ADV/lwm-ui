export class Config {
  constructor(
    public readonly label: string,
    public readonly path: string,
  ) {}

  static All(): Config[] {
    return [
      new Config("Benutzer", "users"),
      new Config("Module", "modules"),
      new Config("Räume", "rooms"),
      new Config("Studiengänge", "degrees"),
      new Config("Semester", "semesters"),
      new Config("Blacklist", "blacklists"),
    ]
  }
}
