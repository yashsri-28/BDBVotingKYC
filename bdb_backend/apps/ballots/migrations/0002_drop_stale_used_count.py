from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('ballots', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE ballots_counterballotallocation DROP CONSTRAINT ballots_counterballotallocation_used_count_e134530e_check;",
            reverse_sql="ALTER TABLE ballots_counterballotallocation ADD CONSTRAINT ballots_counterballotallocation_used_count_e134530e_check CHECK (used_count >= 0);",
        ),
        migrations.RunSQL(
            sql="ALTER TABLE ballots_counterballotallocation DROP COLUMN used_count;",
            reverse_sql="ALTER TABLE ballots_counterballotallocation ADD used_count INT NOT NULL DEFAULT 0;",
        ),
    ]