<div id="login">
    <form method="POST" action="">
        <p>
            <label for="username">Username:</label>
            <input id="username" name="username" type="text" />
        </p>
        <p>
            <label for="password">Password:</label>
            <input id="password" name="password" type="password" />
        </p>
        <p class="err">{$errMsg}</p>
        <p>
            <input type="submit" name="btnSubmit" id="btnSubmit" value="Login" onclick="return formCheck()" />
            <input type="hidden" name="formAction" id="formAction" value="login" />
        </p>
    </form>
</div>