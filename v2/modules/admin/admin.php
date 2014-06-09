<?php

class AdminController extends PlonkController {

    private $errMsg = "&nbsp;";

    /**
     * The views allowed for this module
     * @var array
     */
    protected $views = array(
        'login', 'overview'
    );
    /**
     * The actions allowed for this module
     * @var array
     */
    protected $actions = array(
        'login'
    );

    public function showLogin() {
        //Check for commands
        if ( count($this->urlParts) > 2 ) {
            switch ($this->urlParts[2]) {
                case "logout":
                    PlonkSession::destroy();
                    PlonkWebsite::redirect("/admin");
                    break;
            }
        }

        //Check if we're already logged in
        if ( PlonkSession::exists("admin") ) {
            PlonkWebsite::redirect ('/admin/overview');
        }

        // Main Layout
        // assign vars in our main layout tpl
        $this->mainTpl->assign('pageTitle', 'Login');
        $this->mainTpl->assign('pageMeta',  '
            <link rel="stylesheet" type="text/css" href="/modules/admin/css/admin.css" />
            <script type="text/javascript" src="/modules/admin/js/jquery-ui-1.8.17.custom.min.js"></script>
            <script type="text/javascript" src="/modules/admin/js/admin.js"></script>
        ');

        // Page Layout
        $this->pageTpl->assign('formAction', '/admin');
        $this->pageTpl->assign('errMsg', $this->errMsg);
    }

    public function showOverview() {
        //Security check
        if ( !PlonkSession::exists("admin") ) {
            PlonkWebsite::redirect ('/admin');
        }

        // Main Layout
        // assign vars in our main layout tpl
        $this->mainTpl->assign('pageTitle', 'Admin');
        $this->mainTpl->assign('pageMeta',  '
            <link rel="stylesheet" type="text/css" href="/modules/admin/css/admin.css" />
        ');

        if ( PlonkSession::exists("admin") ) {
            $this->mainTpl->assignOption('oAdminMode');
            $this->mainTpl->assignOption('oAdminActive');
        }

        // Page Layout

    }

    public function doLogin() {
        PlonkSession::start();

        $newAttemptAuthorised = false;

        //Check if user is allowed to login (failled attempts timed out)
        if ( PlonkSession::exists("attempts") ) {
            $attempts = PlonkSession::get("attempts");
            $currentTime = time();
            $lastAttempt = PlonkSession::get("lastAttempt", time());

            $etaTimeout = $lastAttempt + ( $attempts * 2 );

            if ( $currentTime - $etaTimeout >= 0) {
                $newAttemptAuthorised = true;
            } else {
                die();
            }
        } else {
            $newAttemptAuthorised = true;
        }


        if ($newAttemptAuthorised) {

            if ( $_POST["username"] == USERNAME && $_POST["password"] == PASSWORD ) {
                //Successful login

                PlonkSession::set('admin', true);
                PlonkSession::remove("attempts");

                die("<success />");
            } else {
                //Failled login

                if ( PlonkSession::exists("attempts") ) {
                    //Previous failled attempts

                    $attempts = PlonkSession::get("attempts");
                    $attempts++;
                    PlonkSession::set("attempts", $attempts);

                    PlonkSession::set("lastAttempt", time());

                    die('<error id="' . PlonkSession::get("attempts") * 2 .'" />');
                } else {
                    //First time failled attempt

                    PlonkSession::set("attempts", 1);
                    PlonkSession::set("lastAttempt", time());
                    die('<error id="' . PlonkSession::get("attempts") * 2 .'" />');
                }
            }
        }
    }
}

// EOF