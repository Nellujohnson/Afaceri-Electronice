const obj = {
    name: "Iulian",
    greet: function() {
        console.log("Hello " + this.name);
    }
}

obj.greet()