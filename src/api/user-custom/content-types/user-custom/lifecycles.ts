import bcrypt from "bcrypt";

export default {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data.password && !data.password.startsWith("$2b$")) {
      console.log("🔹 Hashing password in beforeCreate");
      data.password = await bcrypt.hash(data.password, 10);
    }
  },
  async beforeUpdate(event) {
    const { data } = event.params;

    if (data.password && !data.password.startsWith("$2b$")) {
      console.log("🔹 Hashing password in beforeUpdate");
      data.password = await bcrypt.hash(data.password, 10);
    }
  },
};
