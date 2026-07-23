class KycPortalRouter:
    """
    Routes apps.kyc_portal models (unmanaged wrappers around the existing
    KYC Portal DB tables: users, members_master, kyc_submissions) to the
    'kyc_db' connection (Kyc_DB_new_3). Every other app's models go to
    'default' (BDB_Voting) — the election module's own database.

    kyc_portal models are read-only in practice (managed=False, no
    migrations run against kyc_db), so writes are never routed there.
    """

    kyc_app = "kyc_portal"

    def db_for_read(self, model, **hints):
        if model._meta.app_label == self.kyc_app:
            return "kyc_db"
        return "default"

    def db_for_write(self, model, **hints):
        if model._meta.app_label == self.kyc_app:
            # Should never happen in practice — kyc_portal models are
            # managed=False / read-only — but if attempted, keep it
            # explicit rather than silently writing to the wrong DB.
            return "kyc_db"
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        # No cross-database relations (SQL Server doesn't support them
        # across DBs the way Django's ORM expects) — every "relation"
        # between kyc_portal data and election data is a soft reference
        # via customer_code, resolved in application code, not a DB FK.
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == self.kyc_app:
            # Never migrate kyc_portal — these tables already exist and
            # are owned by the KYC Portal system, not this project.
            return False
        # Everything else only migrates into 'default' (BDB_Voting).
        return db == "default"
