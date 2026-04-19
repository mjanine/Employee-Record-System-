from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_reportexporthistory'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemconfig',
            name='max_failed_login_attempts',
            field=models.IntegerField(default=5),
        ),
    ]
